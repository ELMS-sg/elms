'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SchemaDebugPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tableSchemas, setTableSchemas] = useState<Record<string, any[]>>({})

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

                // Get schema for each table
                const schemaResults: Record<string, any[]> = {}

                for (const table of tablesData || []) {
                    const tableName = table.table_name

                    try {
                        const { data, error } = await supabase
                            .from('information_schema.columns')
                            .select('column_name, data_type, is_nullable, column_default')
                            .eq('table_schema', 'public')
                            .eq('table_name', tableName)
                            .order('ordinal_position')

                        if (error) {
                            schemaResults[tableName] = [`Error: ${error.message}`]
                        } else {
                            schemaResults[tableName] = data || []
                        }
                    } catch (err: any) {
                        schemaResults[tableName] = [`Exception: ${err.message}`]
                    }
                }

                setTableSchemas(schemaResults)
            } catch (err: any) {
                setError(`Unexpected error: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) return <div className="p-8">Loading database schema...</div>

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Database Schema Debug</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            <div className="space-y-8">
                {Object.entries(tableSchemas).map(([tableName, columns]) => (
                    <div key={tableName} className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">
                            {tableName}
                            <span className="ml-2 text-sm text-gray-500">
                                ({columns.length} columns)
                            </span>
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nullable</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(columns) ? columns.map((column, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{column.column_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.data_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.is_nullable}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{column.column_default || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{columns}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
} 