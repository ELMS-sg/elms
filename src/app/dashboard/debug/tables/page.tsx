'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TablesDebugPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tables, setTables] = useState<any[]>([])
    const [tableData, setTableData] = useState<Record<string, any[]>>({})

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const supabase = createClientComponentClient()

                // Get list of tables
                const { data: tablesData, error: tablesError } = await supabase
                    .from('information_schema.tables')
                    .select('table_name')
                    .eq('table_schema', 'public')
                    .not('table_name', 'like', 'pg_%')
                    .order('table_name')

                if (tablesError) {
                    setError(`Error fetching tables: ${tablesError.message}`)
                    setLoading(false)
                    return
                }

                setTables(tablesData || [])

                // Get sample data from each table
                const tableDataResults: Record<string, any[]> = {}

                for (const table of tablesData || []) {
                    const tableName = table.table_name

                    try {
                        const { data, error } = await supabase
                            .from(tableName)
                            .select('*')
                            .limit(5)

                        if (error) {
                            tableDataResults[tableName] = [`Error: ${error.message}`]
                        } else {
                            tableDataResults[tableName] = data || []
                        }
                    } catch (err: any) {
                        tableDataResults[tableName] = [`Exception: ${err.message}`]
                    }
                }

                setTableData(tableDataResults)
            } catch (err: any) {
                setError(`Unexpected error: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) return <div className="p-8">Loading database tables...</div>

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Database Tables Debug</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Tables Found: {tables.length}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tables.map((table) => (
                        <div key={table.table_name} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {table.table_name}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                {tables.map((table) => (
                    <div key={table.table_name} className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            {table.table_name}
                            <span className="ml-2 text-sm text-gray-500">
                                ({tableData[table.table_name]?.length || 0} rows)
                            </span>
                        </h2>

                        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
                            {JSON.stringify(tableData[table.table_name] || [], null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    )
} 