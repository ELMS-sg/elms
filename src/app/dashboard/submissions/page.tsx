'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    Loader2,
    Filter,
    Search,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    ChevronDown,
    Download,
    BookOpen,
    User,
    Calendar
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

// Custom components
import EmptyState from '@/components/EmptyState'

// Define types for the submissions
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
    status: 'PENDING' | 'SUBMITTED' | 'GRADED'
    grade?: number
    feedback?: string
}

export default function SubmissionsPage() {
    const router = useRouter()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // 'all', 'graded', 'ungraded'
    const [filterClass, setFilterClass] = useState('all')
    const [classes, setClasses] = useState<{ id: string, name: string }[]>([])
    const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                // Fetch submissions data
                const response = await fetch('/api/submissions')
                if (!response.ok) throw new Error('Failed to fetch submissions')

                const data = await response.json()
                setSubmissions(data)
                setFilteredSubmissions(data)

                // Extract unique classes for filter
                const uniqueClasses = Array.from(
                    new Set(data.map((s: Submission) => s.assignment.course.id))
                ).map(id => {
                    const submission = data.find((s: Submission) => s.assignment.course.id === id)
                    return {
                        id: id as string,
                        name: submission ? submission.assignment.course.name : 'Unknown Class'
                    }
                })

                setClasses(uniqueClasses)
            } catch (error) {
                console.error('Error fetching submissions:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSubmissions()
    }, [])

    useEffect(() => {
        // Apply filters and search
        let result = submissions

        // Filter by status
        if (filterStatus === 'graded') {
            result = result.filter(submission => submission.status === 'GRADED')
        } else if (filterStatus === 'ungraded') {
            result = result.filter(submission => submission.status === 'SUBMITTED' && submission.grade === undefined)
        }

        // Filter by class
        if (filterClass !== 'all') {
            result = result.filter(submission => submission.assignment.course.id === filterClass)
        }

        // Search by student name or assignment title
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase()
            result = result.filter(
                submission =>
                    submission.student.name.toLowerCase().includes(lowerCaseSearch) ||
                    submission.assignment.title.toLowerCase().includes(lowerCaseSearch)
            )
        }

        setFilteredSubmissions(result)
    }, [submissions, filterStatus, filterClass, searchTerm])

    const toggleExpand = (submissionId: string) => {
        if (expandedSubmission === submissionId) {
            setExpandedSubmission(null)
        } else {
            setExpandedSubmission(submissionId)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-lg font-medium text-gray-700">Loading submissions...</span>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Submissions</h1>
                <p className="text-gray-600">
                    View and grade all student submissions for your classes
                </p>
            </div>

            {/* Filters and Search */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow-card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by student or assignment"
                            className="input pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            className="input w-full"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Submissions</option>
                            <option value="graded">Graded</option>
                            <option value="ungraded">Needs Grading</option>
                        </select>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            className="input w-full"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                        >
                            <option value="all">All Classes</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            {filteredSubmissions.length === 0 ? (
                <EmptyState
                    title="No submissions found"
                    description="There are no submissions matching your filters."
                    icon={<FileText className="h-12 w-12 text-gray-400" />}
                />
            ) : (
                <div className="space-y-6">
                    {filteredSubmissions.map((submission) => (
                        <div
                            key={submission.id}
                            className="bg-white rounded-lg shadow-card overflow-hidden"
                        >
                            {/* Submission Header */}
                            <div
                                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-gray-50"
                                onClick={() => toggleExpand(submission.id)}
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Student Info */}
                                    <div className="flex-shrink-0">
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
                                        <p className="text-sm text-gray-600">
                                            {submission.assignment.title}
                                        </p>
                                        <div className="flex items-center mt-1 text-xs text-gray-500">
                                            <BookOpen className="w-3 h-3 mr-1" />
                                            {submission.assignment.course.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-start md:items-center md:space-x-4 mt-4 md:mt-0">
                                    {/* Submission Status */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'GRADED'
                                        ? "bg-green-100 text-green-800"
                                        : submission.status === 'SUBMITTED'
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}>
                                        {submission.status === 'GRADED' ? (
                                            <div className="flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Graded
                                            </div>
                                        ) : submission.status === 'SUBMITTED' ? (
                                            <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Needs Grading
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                            </div>
                                        )}
                                    </div>

                                    {/* Submission Date */}
                                    <div className="text-sm text-gray-500 flex items-center mt-2 md:mt-0">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                                    </div>

                                    <ChevronDown className={`w-5 h-5 text-gray-400 mt-2 md:mt-0 transition-transform ${expandedSubmission === submission.id ? 'transform rotate-180' : ''
                                        }`} />
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedSubmission === submission.id && (
                                <div className="border-t border-gray-100 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Assignment Details */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Assignment Details</h4>
                                            <p className="text-sm text-gray-700 mb-3">{submission.assignment.description}</p>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Due Date:</span>
                                                    <p className="text-gray-900 font-medium">
                                                        {format(new Date(submission.assignment.due_date), "MMM d, yyyy 'at' h:mm a")}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Points:</span>
                                                    <p className="text-gray-900 font-medium">{submission.assignment.points}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Submitted:</span>
                                                    <p className="text-gray-900 font-medium">
                                                        {format(new Date(submission.submitted_at), "MMM d, yyyy 'at' h:mm a")}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Assignment Type:</span>
                                                    <p className="text-gray-900 font-medium capitalize">{submission.assignment.assignment_type}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Submission Files */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Submission Files</h4>
                                            {submission.files.length === 0 ? (
                                                <p className="text-sm text-gray-500">No files submitted</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {submission.files.map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                                        >
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
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Grade if available */}
                                    {submission.grade !== undefined && (
                                        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-sm font-medium text-gray-700">Grade:</h4>
                                                <span className="text-lg font-bold text-primary-700">
                                                    {submission.grade}/{submission.assignment.points}
                                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                                        ({Math.round((submission.grade / submission.assignment.points) * 100)}%)
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="mt-3">
                                                <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback:</h4>
                                                <p className="text-gray-600 bg-white p-3 rounded border border-gray-200">
                                                    {submission.feedback || "No feedback provided."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-6 flex justify-end">
                                        {submission.grade === undefined ? (
                                            <Link
                                                href={`/dashboard/assignments/${submission.assignment.id}/submissions/${submission.id}/grade`}
                                                className="btn btn-primary"
                                            >
                                                Grade Submission
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/dashboard/assignments/${submission.assignment.id}/submissions/${submission.id}/grade`}
                                                className="btn btn-outline"
                                            >
                                                Edit Grading
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 