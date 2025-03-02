'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function DebugPage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<any>(null)
    const [classes, setClasses] = useState<any[]>([])
    const [assignments, setAssignments] = useState<any[]>([])
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [rpcResult, setRpcResult] = useState<any>(null)
    const [tableNames, setTableNames] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const supabase = createClientComponentClient()

                // Get current user
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                if (userError) {
                    setError(`Error fetching user: ${userError.message}`)
                    return
                }

                setUser(user)

                // Get table names
                const { data: tables, error: tablesError } = await supabase
                    .from('information_schema.tables')
                    .select('table_name')
                    .eq('table_schema', 'public')
                    .not('table_name', 'ilike', 'pg_%')

                if (tablesError) {
                    console.error('Error fetching tables:', tablesError)
                } else {
                    setTableNames(tables.map(t => t.table_name))
                }

                // Get classes
                const { data: classesData, error: classesError } = await supabase
                    .from('classes')
                    .select('*')

                if (classesError) {
                    setError(`Error fetching classes: ${classesError.message}`)
                    return
                }

                setClasses(classesData || [])

                // Get assignments
                const { data: assignmentsData, error: assignmentsError } = await supabase
                    .from('assignments')
                    .select('*')

                if (assignmentsError) {
                    setError(`Error fetching assignments: ${assignmentsError.message}`)
                    return
                }

                setAssignments(assignmentsData || [])

                // Get enrollments
                const { data: enrollmentsData, error: enrollmentsError } = await supabase
                    .from('class_enrollments')
                    .select('*')

                if (enrollmentsError) {
                    setError(`Error fetching enrollments: ${enrollmentsError.message}`)
                    return
                }

                setEnrollments(enrollmentsData || [])

                // Test RPC function if classes exist
                if (classesData && classesData.length > 0) {
                    const classIds = classesData.map(c => c.id)
                    const { data: rpcData, error: rpcError } = await supabase
                        .rpc('get_enrollment_counts_by_class', { class_ids: classIds })

                    if (rpcError) {
                        console.error('Error calling RPC function:', rpcError)
                    } else {
                        setRpcResult(rpcData)
                    }
                }

            } catch (err: any) {
                setError(`Unexpected error: ${err.message}`)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const formatJson = (data: any) => {
        return JSON.stringify(data, null, 2)
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Debug Information</h1>

            <div className="mb-6">
                <div className="flex space-x-4 mb-4">
                    <Link href="/dashboard/debug/schema" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        View Schema
                    </Link>
                    <Link href="/dashboard/debug/tables" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        View Tables
                    </Link>
                    <Link href="/dashboard/debug/fix-classes" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Fix Classes
                    </Link>
                </div>
            </div>

            {loading && <p className="text-gray-600">Loading debug information...</p>}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">Available Tables</h2>
                        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
                            <pre>{formatJson(tableNames)}</pre>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Current User</h2>
                        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
                            <pre>{formatJson(user)}</pre>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Classes ({classes.length})</h2>
                        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
                            <pre>{formatJson(classes)}</pre>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Assignments ({assignments.length})</h2>
                        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
                            <pre>{formatJson(assignments)}</pre>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">Enrollments ({enrollments.length})</h2>
                        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
                            <pre>{formatJson(enrollments)}</pre>
                        </div>
                    </section>

                    {rpcResult && (
                        <section>
                            <h2 className="text-xl font-semibold mb-3">RPC Result (get_enrollment_counts_by_class)</h2>
                            <div className="bg-gray-100 p-4 rounded overflow-x-auto">
                                <pre>{formatJson(rpcResult)}</pre>
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    )
} 