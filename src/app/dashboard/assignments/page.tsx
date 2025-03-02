import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import { getStudentAssignments, getTeacherAssignments, getAssignmentsToGrade } from "@/lib/assignment-actions"
import {
    Clock,
    Search,
    Filter,
    Plus,
    ChevronRight,
    Download,
    Upload,
    BookOpen,
    BarChart,
    CheckCircle,
} from "lucide-react"
import { format, isPast } from "date-fns"

export const metadata: Metadata = {
    title: "Assignments | English Learning Center",
    description: "View and manage your assignments and submissions",
}

export const dynamic = 'force-dynamic'

export default async function AssignmentsPage() {
    // Get authenticated user
    const user = await requireServerAuth()
    const isTeacher = user.role === 'TEACHER'

    // Fetch real data based on user role
    let pendingAssignments = []
    let completedAssignments = []
    let assignmentsToGrade = []

    if (isTeacher) {
        // For teachers
        const teacherAssignments = await getTeacherAssignments()
        assignmentsToGrade = await getAssignmentsToGrade()

        // We don't have pending/completed for teachers, just their created assignments
        pendingAssignments = teacherAssignments
    } else {
        // For students
        const studentAssignments = await getStudentAssignments()

        // Filter assignments by status
        pendingAssignments = studentAssignments.filter(
            a => a.status === 'pending' || a.status === 'overdue'
        )
        completedAssignments = studentAssignments.filter(
            a => a.status === 'completed'
        )
    }

    // Format dates and other display data
    const formatAssignmentForDisplay = (assignment) => {
        const dueDate = new Date(assignment.due_date)
        const dueDateDisplay = format(dueDate, "MMM d, yyyy 'at' h:mm a")

        // For overdue assignments
        const isOverdue = isPast(dueDate) &&
            (!assignment.submission || assignment.submission.status !== 'graded')

        // For completed assignments
        const submittedDate = assignment.submission?.submitted_at
            ? new Date(assignment.submission.submitted_at)
            : null
        const submittedDateDisplay = submittedDate
            ? format(submittedDate, 'MMM d, yyyy')
            : null

        return {
            ...assignment,
            dueDateDisplay,
            isOverdue,
            submittedDateDisplay
        }
    }

    pendingAssignments = pendingAssignments.map(formatAssignmentForDisplay)
    completedAssignments = completedAssignments.map(formatAssignmentForDisplay)

    // Count assignments by type
    const essayCount = pendingAssignments.filter(a => a.assignment_type === 'essay').length +
        completedAssignments.filter(a => a.assignment_type === 'essay').length
    const exerciseCount = pendingAssignments.filter(a => a.assignment_type === 'exercise').length +
        completedAssignments.filter(a => a.assignment_type === 'exercise').length
    const recordingCount = pendingAssignments.filter(a => a.assignment_type === 'recording').length +
        completedAssignments.filter(a => a.assignment_type === 'recording').length
    const quizCount = pendingAssignments.filter(a => a.assignment_type === 'quiz').length +
        completedAssignments.filter(a => a.assignment_type === 'quiz').length

    // Mock data for assignment categories (we'll replace with real counts)
    const categories = [
        { name: "All Assignments", count: pendingAssignments.length + completedAssignments.length + (isTeacher ? assignmentsToGrade.length : 0), active: true },
        { name: "Pending", count: pendingAssignments.length, active: false },
        { name: "Completed", count: completedAssignments.length, active: false },
        ...(isTeacher ? [{ name: "To Grade", count: assignmentsToGrade.length, active: false }] : []),
        { name: "Essays", count: essayCount, active: false },
        { name: "Exercises", count: exerciseCount, active: false },
        { name: "Recordings", count: recordingCount, active: false },
        { name: "Quizzes", count: quizCount, active: false },
    ]

    // Calculate statistics
    const totalAssignments = completedAssignments.length + pendingAssignments.length
    const completionRate = totalAssignments > 0
        ? Math.round((completedAssignments.length / totalAssignments) * 100)
        : 0

    // Calculate average grade
    let averageGrade = 0
    if (completedAssignments.length > 0) {
        const totalPoints = completedAssignments.reduce((sum, assignment) => {
            if (assignment.submission?.grade) {
                return sum + assignment.submission.grade
            }
            return sum
        }, 0)

        const totalPossiblePoints = completedAssignments.reduce((sum, assignment) => {
            return sum + assignment.points
        }, 0)

        averageGrade = totalPossiblePoints > 0
            ? Math.round((totalPoints / totalPossiblePoints) * 100)
            : 0
    }

    // Calculate average submission time (days before due date)
    let averageSubmissionTime = 0
    if (completedAssignments.length > 0) {
        const totalDaysDifference = completedAssignments.reduce((sum, assignment) => {
            if (assignment.submission?.submitted_at) {
                const dueDate = new Date(assignment.due_date)
                const submittedDate = new Date(assignment.submission.submitted_at)
                const daysDifference = (dueDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24)
                return sum + daysDifference
            }
            return sum
        }, 0)

        averageSubmissionTime = totalDaysDifference / completedAssignments.length
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Assignments</h1>
                <p className="text-gray-600">
                    {isTeacher
                        ? "Create, manage, and grade student assignments"
                        : "View and submit your course assignments and check feedback"}
                </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${category.active
                                ? "bg-primary-100 text-primary-700"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {category.name}
                            <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-white text-gray-500">
                                {category.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="input pl-10 w-full"
                            placeholder="Search assignments..."
                        />
                    </div>
                    <button className="btn btn-outline flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Create Assignment Button (for teachers) */}
            {isTeacher && (
                <div className="flex justify-end mb-6">
                    <Link href="/dashboard/assignments/create" className="btn btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                    </Link>
                </div>
            )}

            {/* Assignments to Grade Section (for teachers) */}
            {isTeacher && assignmentsToGrade.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Assignments to Grade</h2>
                        <Link href="/dashboard/assignments/to-grade" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                            View all <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignmentsToGrade.map((submission) => (
                            <div
                                key={submission.id}
                                className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
                            >
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                                            Needs Grading
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{submission.assignment.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{submission.assignment.description}</p>

                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0 mr-3">
                                            {submission.student.avatar ? (
                                                <Image
                                                    src={submission.student.avatar}
                                                    alt={submission.student.name}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                    {submission.student.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{submission.student.name}</p>
                                            <p className="text-xs text-gray-500">Student</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        {submission.assignment.course.name}
                                    </div>

                                    {submission.files && submission.files.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Submission Files:</p>
                                            {submission.files.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                                                    <span className="text-sm text-gray-600">{file.file_name}</span>
                                                    <span className="text-xs text-gray-500">{Math.round(file.file_size / 1024)} KB</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between">
                                    <Link
                                        href={`/dashboard/assignments/${submission.assignment.id}/submissions/${submission.id}/grade`}
                                        className="btn btn-primary w-full"
                                    >
                                        Grade Submission
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Assignments Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isTeacher ? "Created Assignments" : "Pending Assignments"}
                    </h2>
                    <Link
                        href={isTeacher ? "/dashboard/assignments/created" : "/dashboard/assignments/pending"}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                        View all <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingAssignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
                        >
                            <div className="p-6 flex-grow">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${assignment.isOverdue
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                        }`}>
                                        {assignment.isOverdue
                                            ? "Overdue"
                                            : assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)
                                        }
                                    </span>
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Due {assignment.dueDateDisplay}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>

                                {!isTeacher && (
                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0 mr-3">
                                            {assignment.teacher?.avatar ? (
                                                <Image
                                                    src={assignment.teacher.avatar}
                                                    alt={assignment.teacher.name}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                    {assignment.teacher?.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{assignment.teacher?.name}</p>
                                            <p className="text-xs text-gray-500">Instructor</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    {assignment.course?.name}
                                </div>

                                {assignment.files && assignment.files.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Assignment Files:</p>
                                        {assignment.files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                                                <span className="text-sm text-gray-600">{file.file_name}</span>
                                                <div className="flex items-center">
                                                    <span className="text-xs text-gray-500 mr-2">{Math.round(file.file_size / 1024)} KB</span>
                                                    <a
                                                        href={file.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary-600 hover:text-primary-700"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700">Points: {assignment.points}</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between">
                                <Link
                                    href={`/dashboard/assignments/${assignment.id}`}
                                    className="btn btn-outline flex-1 mr-2"
                                >
                                    View Details
                                </Link>
                                {!isTeacher && (
                                    <Link
                                        href={`/dashboard/assignments/${assignment.id}/submit`}
                                        className="btn btn-primary flex-1"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Submit
                                    </Link>
                                )}
                                {isTeacher && (
                                    <Link
                                        href={`/dashboard/assignments/${assignment.id}/edit`}
                                        className="btn btn-primary flex-1"
                                    >
                                        Edit
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Completed Assignments Section (for students only) */}
            {!isTeacher && completedAssignments.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Completed Assignments</h2>
                        <Link href="/dashboard/assignments/completed" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                            View all <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedAssignments.map((assignment) => (
                            <div
                                key={assignment.id}
                                className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
                            >
                                <div className="p-6 flex-grow">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Completed
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            Submitted {assignment.submittedDateDisplay}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assignment.description}</p>

                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0 mr-3">
                                            {assignment.teacher?.avatar ? (
                                                <Image
                                                    src={assignment.teacher.avatar}
                                                    alt={assignment.teacher.name}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-full border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                                    {assignment.teacher?.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{assignment.teacher?.name}</p>
                                            <p className="text-xs text-gray-500">Instructor</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-4">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        {assignment.course?.name}
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Grade:</span>
                                            <span className="text-sm font-bold text-primary-700">
                                                {assignment.submission?.grade}/{assignment.points}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 italic">
                                            &quot;{assignment.submission?.feedback || "No feedback provided."}&quot;
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 p-4 bg-gray-50">
                                    <Link
                                        href={`/dashboard/assignments/${assignment.id}`}
                                        className="btn btn-outline w-full"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Assignment Statistics */}
            {!isTeacher && (
                <div className="bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                                <CheckCircle className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Completion Rate</p>
                                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Average Submission Time</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {averageSubmissionTime > 0
                                        ? `${averageSubmissionTime.toFixed(1)} days early`
                                        : averageSubmissionTime < 0
                                            ? `${Math.abs(averageSubmissionTime).toFixed(1)} days late`
                                            : "On time"
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                <BarChart className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Average Grade</p>
                                <p className="text-2xl font-bold text-gray-900">{averageGrade}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 