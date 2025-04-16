import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import {
    BarChart3,
    BookOpen,
    Calendar,
    Clock,
    FileText,
    GraduationCap,
    Users,
    CheckCircle,
    ArrowRight,
    Video
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Avatar } from "@/components/Avatar"
import { getUserProfile } from "@/lib/user-actions"
import { getSupabaseRouteHandler } from "@/lib/supabase/client"
import { getUpcomingMeetings } from "@/lib/meeting-actions"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Dashboard | Learning Management System",
    description: "Your learning dashboard",
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // In Next.js, searchParams is passed as a prop and is already resolved
    // We just need to safely access its properties

    // Check for redirect loop - safely handle the searchParams
    let redirectCount = 0;
    if (searchParams && typeof searchParams.redirect_count !== 'undefined') {
        const redirectCountParam = searchParams.redirect_count;
        if (typeof redirectCountParam === 'string') {
            redirectCount = parseInt(redirectCountParam, 10) || 0;
        } else if (Array.isArray(redirectCountParam) && redirectCountParam.length > 0) {
            redirectCount = parseInt(redirectCountParam[0], 10) || 0;
        }
    }

    console.log(`Dashboard page loaded with redirect_count: ${redirectCount}`)

    if (redirectCount >= 3) {
        console.error('Redirect loop detected in dashboard, redirecting to login with error')
        redirect('/login?error=redirect_loop')
    }

    // Use requireAuth which handles the redirect if not authenticated
    const _user = await requireServerAuth()
    const user = await getUserProfile(_user.id)
    const isTeacher = user.role === 'TEACHER'

    // Redirect admin users to admin page
    if (user.role === 'ADMIN') {
        redirect('/admin')
    }

    // Fetch real upcoming meetings
    const upcomingMeetings = await getUpcomingMeetings()

    // Debug enrollments
    if (!isTeacher) {
        console.log("Dashboard: Student user detected, checking enrollments")
        const supabase = await getSupabaseRouteHandler()
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select('*')
            .eq('student_id', user.id)

        console.log("Dashboard: Student enrollments count:", enrollments?.length || 0)
        if (enrollmentError) {
            console.error("Dashboard: Error fetching enrollments:", enrollmentError)
        }
        if (enrollments && enrollments.length > 0) {
            console.log("Dashboard: First enrollment:", JSON.stringify(enrollments[0]))
        } else {
            console.log("Dashboard: No enrollments found for student")
        }
    }

    // Mock data for dashboard statistics - different for teachers and students
    const stats = isTeacher ? [
        {
            label: "Classes Teaching",
            value: "4",
            icon: <BookOpen className="w-5 h-5 text-primary-600" />,
            color: "bg-primary-50 text-primary-700",
        },
        {
            label: "Assignments to Grade",
            value: "7",
            icon: <FileText className="w-5 h-5 text-accent-yellow" />,
            color: "bg-yellow-50 text-yellow-700",
        },
        {
            label: "Scheduled Meetings",
            value: upcomingMeetings.length.toString(),
            icon: <Calendar className="w-5 h-5 text-accent-green" />,
            color: "bg-green-50 text-green-700",
        }
    ] : [
        {
            label: "Courses Enrolled",
            value: "4",
            icon: <BookOpen className="w-5 h-5 text-primary-600" />,
            color: "bg-primary-50 text-primary-700",
        },
        {
            label: "Assignments Due",
            value: "3",
            icon: <FileText className="w-5 h-5 text-accent-yellow" />,
            color: "bg-yellow-50 text-yellow-700",
        },
        {
            label: "Upcoming Meetings",
            value: upcomingMeetings.length.toString(),
            icon: <Calendar className="w-5 h-5 text-accent-green" />,
            color: "bg-green-50 text-green-700",
        },
        {
            label: "Available Courses",
            value: "12",
            icon: <BarChart3 className="w-5 h-5 text-accent-red" />,
            color: "bg-red-50 text-red-700",
        },
    ]

    // Mock data for upcoming events - different for teachers and students
    const upcomingEvents = isTeacher ? [
        {
            title: "Advanced JavaScript Lecture",
            date: "Today, 2:00 PM",
            type: "Teaching",
            icon: <GraduationCap className="w-4 h-4" />,
        },
        {
            title: "Grade Project Submissions",
            date: "Tomorrow, 11:59 PM",
            type: "Grading",
            icon: <FileText className="w-4 h-4" />,
        },
        {
            title: "Faculty Meeting",
            date: "Wed, 4:00 PM",
            type: "Meeting",
            icon: <Users className="w-4 h-4" />,
        },
    ] : [
        {
            title: "Advanced JavaScript Lecture",
            date: "Today, 2:00 PM",
            type: "Class",
            icon: <GraduationCap className="w-4 h-4" />,
        },
        {
            title: "Project Milestone Due",
            date: "Tomorrow, 11:59 PM",
            type: "Assignment",
            icon: <FileText className="w-4 h-4" />,
        },
        {
            title: "Study Group Meeting",
            date: "Wed, 4:00 PM",
            type: "Meeting",
            icon: <Users className="w-4 h-4" />,
        },
    ]

    // Mock data for recent activity - different for teachers and students
    const recentActivity = isTeacher ? [
        {
            title: "Graded Quiz: React Fundamentals",
            time: "2 hours ago",
            icon: <CheckCircle className="w-4 h-4 text-accent-green" />,
        },
        {
            title: "Created Assignment: Advanced CSS Techniques",
            time: "Yesterday",
            icon: <FileText className="w-4 h-4 text-primary-600" />,
        },
        {
            title: "Added Class: Web Development Fundamentals",
            time: "2 days ago",
            icon: <Users className="w-4 h-4 text-accent-yellow" />,
        },
    ] : [
        {
            title: "Completed Quiz: React Fundamentals",
            time: "2 hours ago",
            icon: <CheckCircle className="w-4 h-4 text-accent-green" />,
        },
        {
            title: "Submitted Assignment: UI Design Principles",
            time: "Yesterday",
            icon: <FileText className="w-4 h-4 text-primary-600" />,
        },
        {
            title: "Joined Class: Advanced CSS Techniques",
            time: "2 days ago",
            icon: <Users className="w-4 h-4 text-accent-yellow" />,
        },
    ]

    return (
        <div className="pt-8 pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name || "Student"}</h1>
                    <p className="text-gray-600 mt-1">Here&apos;s an overview of your learning progress</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white overflow-hidden shadow-card rounded-lg"
                        >
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.color.split(' ')[0]}`}>
                                        {stat.icon}
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">
                                                {stat.label}
                                            </dt>
                                            <dd>
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {stat.value}
                                                </div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow-card rounded-lg lg:col-span-1">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
                            <div className="flex items-center mb-4">
                                <Avatar
                                    url={user.avatar_url}
                                    name={user.name || user.email}
                                    size="md"
                                    className="mr-4"
                                />
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <p className="text-sm text-gray-500 capitalize">{user.role || "student"}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                {isTeacher ? (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">You're currently teaching {stats[0].value} classes and have {upcomingMeetings.length} upcoming meetings.</p>
                                        <Link href="/dashboard/classes" className="text-sm text-primary-600 hover:text-primary-700">
                                            View your teaching schedule →
                                        </Link>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">You're enrolled in {stats[0].value} courses and have {upcomingMeetings.length} upcoming meetings.</p>
                                        <Link href="/dashboard/classes" className="text-sm text-primary-600 hover:text-primary-700">
                                            View your learning progress →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Meetings */}
                    <div className="bg-white overflow-hidden shadow-card rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
                                <Link href="/dashboard/meetings" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                                    View all <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {upcomingMeetings.length > 0 ? (
                                    upcomingMeetings.slice(0, 3).map((meeting) => (
                                        <div key={meeting.id} className="flex items-start">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="p-2 rounded-md bg-gray-100 text-gray-600">
                                                    {meeting.type === "ONE_ON_ONE" ? (
                                                        <Users className="w-4 h-4" />
                                                    ) : (
                                                        <Video className="w-4 h-4" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                                                <div className="flex items-center mt-1">
                                                    <Clock className="w-3 h-3 text-gray-500 mr-1" />
                                                    <p className="text-xs text-gray-500">{meeting.displayDate}, {meeting.startTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">No upcoming meetings</p>
                                        <Link href="/dashboard/meetings" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block">
                                            Schedule a meeting
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Achievement */}
                    <div className="bg-white overflow-hidden shadow-card rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Achievement</h2>
                            </div>
                            <div className="text-center py-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-accent-yellow mb-3">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Achievements Coming Soon</h3>
                                {isTeacher ? (
                                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                                        Track your teaching impact and student progress. Our upcoming achievement system will help you measure effectiveness and showcase your teaching excellence.
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500 max-w-md mx-auto">
                                        Track your learning milestones, earn certificates, and showcase your progress. We're building a comprehensive achievement system for your educational journey.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Link href="/dashboard/classes" className="group">
                        <div className="bg-white overflow-hidden shadow-card rounded-lg hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-md bg-primary-50 text-primary-600">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                                            {isTeacher ? "My Teaching Classes" : "My Classes"}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {isTeacher ? "Manage your teaching schedule" : "View your enrolled courses"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/assignments" className="group">
                        <div className="bg-white overflow-hidden shadow-card rounded-lg hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-md bg-yellow-50 text-yellow-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">Assignments</h3>
                                        <p className="text-sm text-gray-500">
                                            {isTeacher ? "Create and grade assignments" : "Check your pending tasks"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/dashboard/meetings" className="group">
                        <div className="bg-white overflow-hidden shadow-card rounded-lg hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-md bg-green-50 text-green-600">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">Meetings</h3>
                                        <p className="text-sm text-gray-500">
                                            {isTeacher ? "Create and manage Zoom meetings" : "Schedule and join meetings"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
} 