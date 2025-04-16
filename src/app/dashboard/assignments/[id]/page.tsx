import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireServerAuth } from "@/lib/actions"
import { getAssignment } from "@/lib/assignment-actions"
import { format } from "date-fns"
import {
    ArrowLeft,
    Clock,
    Download,
    Upload,
    File,
    CheckCircle,
    AlertCircle,
    BookOpen,
    Edit
} from "lucide-react"

export const metadata: Metadata = {
    title: "Assignment Details | English Learning Center",
    description: "View assignment details and submission status",
}

export const dynamic = 'force-dynamic'

export default async function AssignmentDetailPage({
    params
}: {
    params: { id: string }
}) {
    // Get authenticated user
    const user = await requireServerAuth()
    const isTeacher = user.role === 'TEACHER'

    // Get the assignment
    const assignment = await getAssignment(params.id)

    // If assignment not found
    if (!assignment) {
        notFound()
    }

    // Format dates
    const dueDate = new Date(assignment.due_date)
    const dueDateDisplay = format(dueDate, 'MMMM d, yyyy')
    const isPastDue = dueDate < new Date()

    // Get submission status
    const hasSubmission = !!assignment.submission

    // Format submission date if available
    const submittedDate = assignment.submission?.submitted_at
        ? new Date(assignment.submission.submitted_at)
        : null
    const submittedDateDisplay = submittedDate
        ? format(submittedDate, 'MMMM d, yyyy')
        : null

    // Check if submission was late
    const isLate = submittedDate && submittedDate > dueDate

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/dashboard/assignments" className="text-gray-600 hover:text-gray-900 flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Assignments
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Due {dueDateDisplay}
                    </div>
                    <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {assignment.course?.name}
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">Points: {assignment.points}</span>
                    </div>
                </div>

                {isPastDue && !assignment.submission?.grade && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start mt-4">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Overdue Assignment</p>
                            <p className="text-sm">This assignment is past due. Submit as soon as possible.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Assignment Description */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Description</h2>
                        <div className="prose max-w-none">
                            <p className="text-gray-700">{assignment.description}</p>
                        </div>
                    </div>

                    {/* Assignment Files */}
                    {assignment.files && assignment.files.length > 0 && (
                        <div className="bg-white rounded-lg shadow-card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Files</h2>
                            <div className="space-y-4">
                                {assignment.files.map((file) => {
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
                                                        <File className="w-4 h-4 text-gray-400 mr-2" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">{file.file_name}</p>
                                                            <p className="text-xs text-gray-500">{Math.round(file.file_size / 1024)} KB</p>
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
                        </div>
                    )}

                    {/* Submission Section (for students) */}
                    {!isTeacher && (
                        <div className="bg-white rounded-lg shadow-card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission</h2>

                            {!hasSubmission && (
                                <div className="text-center py-8 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Submission Yet</h3>
                                    <p className="text-gray-500 mb-4">Upload your files to submit this assignment</p>
                                    <Link
                                        href={`/dashboard/assignments/${assignment.id}/submit`}
                                        className="btn btn-primary flex items-center justify-center w-[300px]"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        <span>
                                            Submit Assignment
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {hasSubmission && (
                                <div>
                                    <div className="flex items-center mb-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${assignment.submission?.grade // If it has a grade, it's been graded
                                            ? "bg-green-100 text-green-800"
                                            : isLate
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-blue-100 text-blue-800"
                                            }`}>
                                            {assignment.submission?.grade ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Graded
                                                </>
                                            ) : isLate ? (
                                                <>
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Submitted Late
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Submitted
                                                </>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500 ml-3">
                                            Submitted on {submittedDateDisplay}
                                        </span>
                                    </div>

                                    {/* Submission Files */}
                                    {assignment.submission.files && assignment.submission.files.length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">Your Submission:</h3>
                                            <div className="space-y-4">
                                                {assignment.submission.files.map((file) => {
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
                                                                        <File className="w-4 h-4 text-gray-400 mr-2" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-700">{file.file_name}</p>
                                                                            <p className="text-xs text-gray-500">{Math.round(file.file_size / 1024)} KB</p>
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
                                        </div>
                                    )}

                                    {/* Grade and Feedback */}
                                    {assignment.submission?.grade && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-medium text-gray-700">Grade:</h3>
                                                <span className="text-lg font-bold text-primary-700">
                                                    {assignment.submission.grade}/{assignment.points}
                                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                                        ({Math.round((assignment.submission.grade / assignment.points) * 100)}%)
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="mt-3">
                                                <h3 className="text-sm font-medium text-gray-700 mb-1">Feedback:</h3>
                                                <p className="text-gray-600 bg-white p-3 rounded border border-gray-200">
                                                    {assignment.submission.feedback || "No feedback provided."}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resubmit Button (if not graded) */}
                                    {assignment.submission && !assignment.submission.grade && (
                                        <div className="mt-4">
                                            <Link
                                                href={`/dashboard/assignments/${assignment.id}/submit`}
                                                className="btn btn-primary flex items-center justify-center w-[300px]"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                <span>Update Submission</span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Teacher Actions (for teachers) */}
                    {isTeacher && (
                        <div className="bg-white rounded-lg shadow-card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Teacher Actions</h2>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={`/dashboard/assignments/${assignment.id}/edit`}
                                    className="flex items-center btn btn-outline"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    <span>
                                        Edit Assignment
                                    </span>
                                </Link>
                                <Link
                                    href={`/dashboard/assignments/${assignment.id}/submissions`}
                                    className="btn btn-primary"
                                >
                                    View Submissions
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Teacher Info */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h2>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 mr-4">
                                {assignment.teacher?.avatar ? (
                                    <Image
                                        src={assignment.teacher.avatar}
                                        alt={assignment.teacher.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                        {assignment.teacher?.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{assignment.teacher?.name}</p>
                                <p className="text-sm text-gray-500">{assignment.teacher?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Assignment Info */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Assignment Type</p>
                                <p className="font-medium text-gray-900 capitalize">
                                    {assignment.assignment_type || "Assignment"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Due Date</p>
                                <p className="font-medium text-gray-900">
                                    {dueDateDisplay}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Points</p>
                                <p className="font-medium text-gray-900">
                                    {assignment.points} points
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Course</p>
                                <p className="font-medium text-gray-900">
                                    {assignment.course?.name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 