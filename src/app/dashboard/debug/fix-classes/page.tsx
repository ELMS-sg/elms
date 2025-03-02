'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function FixClassesPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fixClasses = async () => {
        try {
            setLoading(true)
            setResult(null)
            setError(null)

            const supabase = createClientComponentClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError('Not authenticated')
                return
            }

            // Check if there are any classes
            const { data: existingClasses, error: classesError } = await supabase
                .from('classes')
                .select('id')
                .limit(1)

            if (classesError) {
                setError(`Error checking classes: ${classesError.message}`)
                return
            }

            // If there are no classes, insert sample data
            if (!existingClasses || existingClasses.length === 0) {
                // Insert a sample class
                const { data: classData, error: insertError } = await supabase
                    .from('classes')
                    .insert([
                        {
                            name: 'IELTS Academic Preparation',
                            description: 'Comprehensive preparation for the IELTS Academic test, covering all four skills: reading, writing, listening, and speaking.',
                            teacher_id: user.id,
                            start_date: new Date().toISOString(),
                            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
                            schedule: 'Tuesdays and Thursdays, 6:00 PM - 8:00 PM',
                            capacity: 20,
                            enrolled_count: 0,
                            image: '/images/ielts-academic.jpg',
                            tags: ['IELTS', 'Academic'],
                            learning_method: 'Hybrid'
                        }
                    ])
                    .select()

                if (insertError) {
                    setError(`Error inserting class: ${insertError.message}`)
                    return
                }

                setResult(`Successfully created sample class: ${classData?.[0]?.name}`)
            } else {
                setResult('Classes already exist in the database')
            }

            // Check if there are any assignments
            const { data: existingAssignments, error: assignmentsError } = await supabase
                .from('assignments')
                .select('id')
                .limit(1)

            if (assignmentsError) {
                setError(`Error checking assignments: ${assignmentsError.message}`)
                return
            }

            // If there are no assignments, insert sample data
            if (!existingAssignments || existingAssignments.length === 0) {
                // Get the class ID
                const { data: classes } = await supabase
                    .from('classes')
                    .select('id')
                    .limit(1)

                if (classes && classes.length > 0) {
                    const classId = classes[0].id

                    // Insert a sample assignment
                    const { data: assignmentData, error: insertError } = await supabase
                        .from('assignments')
                        .insert([
                            {
                                title: 'IELTS Writing Task 1',
                                description: 'Write a report describing the data in the chart. Minimum 150 words.',
                                class_id: classId,
                                teacher_id: user.id,
                                due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                                points: 100,
                                assignment_type: 'essay'
                            }
                        ])
                        .select()

                    if (insertError) {
                        setError(`Error inserting assignment: ${insertError.message}`)
                        return
                    }

                    setResult((prev) => `${prev}\nSuccessfully created sample assignment: ${assignmentData?.[0]?.title}`)
                }
            } else {
                setResult((prev) => `${prev}\nAssignments already exist in the database`)
            }

        } catch (err: any) {
            setError(`Unexpected error: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Fix Classes and Assignments</h1>

            <div className="mb-6">
                <p className="text-gray-600 mb-4">
                    This page will check if there are any classes and assignments in the database.
                    If none exist, it will create sample data.
                </p>

                <button
                    onClick={fixClasses}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Fix Classes and Assignments'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p><strong>Error:</strong> {error}</p>
                </div>
            )}

            {result && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    <pre className="whitespace-pre-wrap">{result}</pre>
                </div>
            )}
        </div>
    )
} 