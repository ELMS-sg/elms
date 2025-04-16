'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    Loader2,
    FileText,
    CheckCircle,
    ArrowLeft,
    Download,
    Calendar,
    User,
    BookOpen
} from 'lucide-react'
import { format } from 'date-fns'

// Define types for the grading form data
interface SubmissionFile {
    id: string
    submission_id: string
    file_name: string
    file_size: number
    file_type: string
    file_url: string
}

interface Student {
    id: string
    name: string
    email: string
    avatar?: string
}

interface AssignmentClass {
    id: string
    name: string
}

interface Assignment {
    id: string
    title: string
    description: string
    due_date: string
    points: number
    assignment_type: string
    course: AssignmentClass
}

interface Submission {
    id: string
    student: Student
    assignment: Assignment
    submitted_at: string
    files: SubmissionFile[]
    grade?: number
    feedback?: string
}

export default function GradeSubmissionPage({ params }: { params: { id: string, submissionId: string } }) {
    const router = useRouter()
    const { id: assignmentId, submissionId } = params

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submission, setSubmission] = useState<Submission | null>(null)
    const [grade, setGrade] = useState<number | ''>('')
    const [feedback, setFeedback] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const fetchSubmission = async () => {
            try {
                const response = await fetch(`/api/submissions/${submissionId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch submission')
                }

                const data = await response.json()
                setSubmission(data)

                // Pre-fill form if submission is already graded
                if (data.grade !== undefined) {
                    setGrade(data.grade)
                    setFeedback(data.feedback || '')
                }
            } catch (error) {
                console.error('Error fetching submission:', error)
                setError('Failed to load submission data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchSubmission()
    }, [submissionId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        if (grade === '' || grade < 0 || grade > (submission?.assignment.points || 100)) {
            setError(`Please enter a valid grade between 0 and ${submission?.assignment.points || 100}`)
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch('/api/submissions/grade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    grade: Number(grade),
                    feedback,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to submit grade')
            }

            setSuccess(true)

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/dashboard/submissions')
                router.refresh()
            }, 2000)
        } catch (err) {
            console.error('Error grading submission:', err)
            setError('Failed to submit grade. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-lg font-medium text-gray-700">Loading submission...</span>
            </div>
        )
    }

    if (!submission) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Error</h2>
                    <p>{error || 'Submission not found'}</p>
                    <Link
                        href="/dashboard/submissions"
                        className="text-red-700 font-medium hover:text-red-800 mt-2 inline-block"
                    >
                        <ArrowLeft className="w-4 h-4 inline mr-1" />
                        Back to submissions
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/dashboard/submissions" className="text-gray-600 hover:text-gray-900 flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to submissions
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Grade Submission</h1>
                <p className="text-gray-600">
                    Review and grade the student's submission
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Assignment & Student Info */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-card overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{submission.assignment.title}</h2>

                            {/* Student Info */}
                            <div className="flex items-center mb-6">
                                <div className="flex-shrink-0 mr-4">
                                    {submission.student.avatar ? (
                                        <Image
                                            src={submission.student.avatar}
                                            alt={submission.student.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {submission.student.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">{submission.student.email}</p>
                                </div>
                            </div>

                            {/* Assignment Details */}
                            <div className="mb-6">
                                <h3 className="text-md font-semibold text-gray-900 mb-2">Assignment Details</h3>
                                <p className="text-gray-700 mb-4">{submission.assignment.description}</p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-gray-700">Due: {format(new Date(submission.assignment.due_date), "MMM d, yyyy")}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-gray-700">{submission.assignment.course.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-gray-700">Total Points: {submission.assignment.points}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                        <span className="text-gray-700">Submitted: {format(new Date(submission.submitted_at), "MMM d, yyyy")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Submission Files */}
                            <div>
                                <h3 className="text-md font-semibold text-gray-900 mb-2">Submission Files</h3>
                                {submission.files.length === 0 ? (
                                    <p className="text-gray-500">No files submitted</p>
                                ) : (
                                    <div className="space-y-4">
                                        {submission.files.map((file) => {
                                            const isVideo = file.file_name.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i);
                                            return (
                                                <div key={file.id} className="rounded-lg">
                                                    {isVideo ? (
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium text-gray-700">{file.file_name}</p>
                                                                <a
                                                                    href={file.file_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-primary-600 hover:text-primary-700"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </a>
                                                            </div>
                                                            <div className="rounded-lg overflow-hidden border border-gray-200">
                                                                <video
                                                                    controls
                                                                    className="w-full h-auto"
                                                                    src={file.file_url}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                            <div className="flex items-center">
                                                                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">{file.file_name}</p>
                                                                    <p className="text-xs text-gray-500">{(file.file_size / 1024).toFixed(1)} KB</p>
                                                                </div>
                                                            </div>
                                                            <a
                                                                href={file.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary-600 hover:text-primary-700"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Grading Form */}
                <div>
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Submission</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Grade */}
                            <div>
                                <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                                    Grade (out of {submission.assignment.points})
                                </label>
                                <input
                                    type="number"
                                    id="grade"
                                    min="0"
                                    max={submission.assignment.points}
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            {/* Feedback */}
                            <div>
                                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback
                                </label>
                                <textarea
                                    id="feedback"
                                    rows={6}
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="input w-full"
                                    placeholder="Provide feedback to the student..."
                                ></textarea>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-start">
                                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm">Grade submitted successfully! Redirecting...</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Link
                                    href="/dashboard/submissions"
                                    className="btn btn-outline mr-2"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Submit Grade
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
} 