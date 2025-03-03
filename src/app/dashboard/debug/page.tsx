'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'

export default function DebugPage() {
    const [classes, setClasses] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [addingEnrollments, setAddingEnrollments] = useState(false)

    // Fetch all classes with enrollment counts
    useEffect(() => {
        async function fetchClasses() {
            try {
                setLoading(true)
                const response = await axios.get('/api/debug/class-enrollments')
                setClasses(response.data.classes || [])
                setError('')
            } catch (err: any) {
                console.error('Error fetching classes:', err)
                setError(err.message || 'Failed to fetch classes')
            } finally {
                setLoading(false)
            }
        }

        fetchClasses()
    }, [])

    // Fetch details for a specific class
    const fetchClassDetails = async (classId: string) => {
        try {
            setLoading(true)
            setSuccess('')
            const response = await axios.get(`/api/debug/class-enrollments?classId=${classId}`)
            setSelectedClass(response.data)
            setError('')
        } catch (err: any) {
            console.error('Error fetching class details:', err)
            setError(err.message || 'Failed to fetch class details')
            setSelectedClass(null)
        } finally {
            setLoading(false)
        }
    }

    // Add enrollments to the selected class
    const addEnrollments = async () => {
        if (!selectedClass?.class?.id) return

        try {
            setAddingEnrollments(true)
            setError('')
            setSuccess('')

            const response = await axios.post('/api/debug/add-enrollments', {
                classId: selectedClass.class.id
            })

            setSuccess(response.data.message)

            // Refresh class details
            await fetchClassDetails(selectedClass.class.id)
        } catch (err: any) {
            console.error('Error adding enrollments:', err)
            setError(err.response?.data?.error || err.message || 'Failed to add enrollments')
        } finally {
            setAddingEnrollments(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Debug: Class Enrollments</h1>

            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="text-primary-600 hover:underline"
                >
                    Back to Dashboard
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                    <p>{success}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-lg font-semibold mb-4">Classes</h2>

                    {loading && !classes.length ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {classes.map((classItem) => (
                                <li key={classItem.id}>
                                    <button
                                        onClick={() => fetchClassDetails(classItem.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md ${selectedClass?.class?.id === classItem.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="font-medium">{classItem.name}</span>
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({classItem.studentCount} students)
                                        </span>
                                    </button>
                                </li>
                            ))}

                            {classes.length === 0 && !loading && (
                                <li className="text-gray-500 p-2">No classes found</li>
                            )}
                        </ul>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-card p-6 md:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Class Details</h2>

                    {loading && selectedClass ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                    ) : selectedClass ? (
                        <div>
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-medium">{selectedClass.class.name}</h3>
                                    <p className="text-gray-500">ID: {selectedClass.class.id}</p>
                                    <p className="text-gray-500">
                                        {selectedClass.studentCount} student(s) enrolled
                                    </p>
                                </div>
                                <button
                                    onClick={addEnrollments}
                                    disabled={addingEnrollments}
                                    className="btn btn-primary btn-sm"
                                >
                                    {addingEnrollments ? 'Adding...' : 'Add Sample Students'}
                                </button>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium mb-2">Enrollments</h4>
                                {selectedClass.enrollments.length > 0 ? (
                                    <ul className="space-y-1 text-sm">
                                        {selectedClass.enrollments.map((enrollment: any) => (
                                            <li key={enrollment.id} className="bg-gray-50 p-2 rounded">
                                                <p>ID: {enrollment.id}</p>
                                                <p>Student ID: {enrollment.student_id}</p>
                                                <p>Created: {new Date(enrollment.created_at).toLocaleString()}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No enrollments found</p>
                                )}
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Students</h4>
                                {selectedClass.students.length > 0 ? (
                                    <ul className="space-y-2">
                                        {selectedClass.students.map((student: any) => (
                                            <li key={student.id} className="bg-gray-50 p-3 rounded">
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-gray-600">{student.email}</p>
                                                <p className="text-gray-500">ID: {student.id}</p>
                                                <p className="text-gray-500">Role: {student.role}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No student details found</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            Select a class to view details
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
} 