'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function CheckColumnsPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [classesColumns, setClassesColumns] = useState<any[]>([])
    const [assignmentsColumns, setAssignmentsColumns] = useState<any[]>([])
    const [enrollmentsColumns, setEnrollmentsColumns] = useState<any[]>([])

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                setLoading(true)
                setError(null)

                const supabase = createClientComponentClient()

                // Get columns for classes table
                const { data: classesData, error: classesError } = await supabase
                    .from('information_schema.columns')
                    .select('column_name, data_type, is_nullable')
                    .eq('table_schema', 'public')
                    .eq('table_name', 'classes')
                    .order('ordinal_position')

                if (classesError) {
                    setError(`Error fetching classes columns: ${classesError.message}`)
                    return
                }

                setClassesColumns(classesData || [])

                // Get columns for assignments table
                const { data: assignmentsData, error: assignmentsError } = await supabase
                    .from('information_schema.columns')
                    .select('column_name, data_type, is_nullable')
                    .eq('table_schema', 'public')
                    .eq('table_name', 'assignments')
                    .order('ordinal_position')

                if (assignmentsError) {
                    setError(`Error fetching assignments columns: ${assignmentsError.message}`)
                    return
                }

                setAssignmentsColumns(assignmentsData || [])

                // Get columns for class_enrollments table
                const { data: enrollmentsData, error: enrollmentsError } = await supabase
                    .from('information_schema.columns')
                    .select('column_name, data_type, is_nullable')
                    .eq('table_schema', 'public')
                    .eq('table_name', 'class_enrollments')
                    .order('ordinal_position')

                if (enrollmentsError) {
                    setError(`Error fetching enrollments columns: ${enrollmentsError.message}`)
                    return
                }

                setEnrollmentsColumns(enrollmentsData || [])

            } catch (err: any) {
                setError(`Unexpected error: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }

        fetchColumns()
    }, [])

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Database Column Check</h1>

            {loading && <p className="text-gray-600">Loading column information...</p>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Classes Table Columns</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b">Column Name</th>
                                        <th className="py-2 px-4 border-b">Data Type</th>
                                        <th className="py-2 px-4 border-b">Nullable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classesColumns.map((column, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="py-2 px-4 border-b">{column.column_name}</td>
                                            <td className="py-2 px-4 border-b">{column.data_type}</td>
                                            <td className="py-2 px-4 border-b">{column.is_nullable}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Assignments Table Columns</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b">Column Name</th>
                                        <th className="py-2 px-4 border-b">Data Type</th>
                                        <th className="py-2 px-4 border-b">Nullable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignmentsColumns.map((column, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="py-2 px-4 border-b">{column.column_name}</td>
                                            <td className="py-2 px-4 border-b">{column.data_type}</td>
                                            <td className="py-2 px-4 border-b">{column.is_nullable}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Class Enrollments Table Columns</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b">Column Name</th>
                                        <th className="py-2 px-4 border-b">Data Type</th>
                                        <th className="py-2 px-4 border-b">Nullable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollmentsColumns.map((column, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="py-2 px-4 border-b">{column.column_name}</td>
                                            <td className="py-2 px-4 border-b">{column.data_type}</td>
                                            <td className="py-2 px-4 border-b">{column.is_nullable}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
} 