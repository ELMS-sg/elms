import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import { getStudentAssignments, getTeacherAssignments, getAssignmentsToGrade } from "@/lib/assignment-actions"
import {
    Plus,
    ChevronRight,
    BarChart,
    CheckCircle,
    FileText,
} from "lucide-react"
import { format, isPast } from "date-fns"
import { getUserProfile } from "@/lib/user-actions"
import Link from "next/link"
import { Suspense } from "react"

// Import client components
import { ClientSearchFilter } from "@/components/ClientSearchFilter.jsx"
import { ClientAssignments } from "@/components/ClientAssignments.jsx"

export const metadata: Metadata = {
    title: "Assignments | English Learning Center",
    description: "View and manage your assignments and submissions",
}

export const dynamic = 'force-dynamic'

export default async function AssignmentsPage() {
    // Get authenticated user
    const _user = await requireServerAuth()
    const user = await getUserProfile(_user.id)
    const isTeacher = user.role === 'TEACHER'

    // Fetch real data based on user role
    let pendingAssignments = []
    let completedAssignments = []
    let assignmentsToGrade = []

    if (isTeacher) {
        // For teachers
        const teacherAssignments = await getTeacherAssignments()
        console.log('Teacher assignments with stats:', teacherAssignments.map(a => ({
            id: a.id,
            title: a.title,
            submissionStats: a.submissionStats
        })))
        assignmentsToGrade = await getAssignmentsToGrade()

        // We don't have pending/completed for teachers, just their created assignments
        pendingAssignments = teacherAssignments
    } else {
        // For students
        const studentAssignments = await getStudentAssignments()

        // Filter assignments by status
        pendingAssignments = studentAssignments.filter(
            a => a.status === 'pending' || a.status === 'overdue' || a.status === 'submitted'
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

        const formatted = {
            ...assignment,
            dueDateDisplay,
            isOverdue,
            submittedDateDisplay,
            submissionStats: assignment.submissionStats
        }
        return formatted
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

    // Categories for filter buttons
    const categories = [
        { name: "All Assignments", count: pendingAssignments.length + completedAssignments.length + (isTeacher ? assignmentsToGrade.length : 0) },
        { name: "Pending", count: pendingAssignments.length },
        { name: "Completed", count: completedAssignments.length },
        ...(isTeacher ? [{ name: "To Grade", count: assignmentsToGrade.length }] : []),
        { name: "Essays", count: essayCount },
        { name: "Exercises", count: exerciseCount },
        { name: "Recordings", count: recordingCount },
        { name: "Quizzes", count: quizCount },
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isTeacher ? "Assignments Management" : "My Assignments"}
                </h1>
                <p className="text-gray-600">
                    {isTeacher
                        ? "Create, manage, and grade student assignments"
                        : "View and submit your course assignments and check feedback"}
                </p>
            </div>

            {isTeacher && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Link href="/dashboard/assignments/create" className="bg-white rounded-lg shadow-card p-4 flex items-center hover:shadow-card-hover transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-primary-50 text-primary-600 mr-3">
                            <Plus className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Create Assignment</h3>
                            <p className="text-sm text-gray-500">Add a new assignment</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/assignments/to-grade" className="bg-white rounded-lg shadow-card p-4 flex items-center hover:shadow-card-hover transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-3">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Grade Submissions</h3>
                            <p className="text-sm text-gray-500">Review student work</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/assignments/analytics" className="bg-white rounded-lg shadow-card p-4 flex items-center hover:shadow-card-hover transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-green-50 text-green-600 mr-3">
                            <BarChart className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Assignment Analytics</h3>
                            <p className="text-sm text-gray-500">View performance data</p>
                        </div>
                    </Link>
                </div>
            )}

            {/* Search and Filter - Client Component */}
            <Suspense fallback={<div>Loading filters...</div>}>
                <ClientSearchFilter
                    categories={categories}
                    pendingAssignments={pendingAssignments}
                    completedAssignments={completedAssignments}
                    assignmentsToGrade={assignmentsToGrade}
                    isTeacher={isTeacher}
                />
            </Suspense>

            {/* Create Assignment Button (for teachers) */}
            {isTeacher && (
                <div className="flex justify-end mb-6">
                    <Link href="/dashboard/assignments/create" className="btn btn-primary flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Assignment
                    </Link>
                </div>
            )}

            {/* Client-side filtered assignments */}
            <Suspense fallback={<div>Loading assignments...</div>}>
                <ClientAssignments
                    pendingAssignments={pendingAssignments}
                    completedAssignments={completedAssignments}
                    assignmentsToGrade={assignmentsToGrade}
                    isTeacher={isTeacher}
                />
            </Suspense>

            {/* Teacher-specific Analytics Section */}
            {isTeacher && (
                <div className="bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                                <CheckCircle className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Average Submission Rate</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pendingAssignments.length > 0
                                        ? Math.round(
                                            pendingAssignments.reduce((sum, a) =>
                                                sum + (a.submissionStats?.submissionRate || 0), 0) / pendingAssignments.length
                                        )
                                        : 0}%
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                                <CheckCircle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Submissions</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pendingAssignments.reduce((sum, a) =>
                                        sum + (a.submissionStats?.submittedStudents || 0), 0)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                <BarChart className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {pendingAssignments.length > 0
                                        ? Math.max(...pendingAssignments.map(a => a.submissionStats?.totalStudents || 0))
                                        : 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assignment Statistics for students */}
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
                                <CheckCircle className="w-6 h-6 text-amber-600" />
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