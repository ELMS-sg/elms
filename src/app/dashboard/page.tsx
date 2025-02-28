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
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"

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
    // In Next.js 15, searchParams is a dynamic API that should be awaited
    // But since it's passed as a prop, we don't need to await it directly
    // We just need to handle it properly

    // Check for redirect loop - properly handle the searchParams
    const redirectCount = searchParams && 'redirect_count' in searchParams &&
        typeof searchParams.redirect_count === 'string'
        ? parseInt(searchParams.redirect_count)
        : 0;

    console.log(`Dashboard page loaded with redirect_count: ${redirectCount}`)

    if (redirectCount >= 3) {
        console.error('Redirect loop detected in dashboard, redirecting to login with error')
        redirect('/login?error=redirect_loop')
    }

    // Use requireAuth which handles the redirect if not authenticated
    const user = await requireServerAuth()

    // Mock data for dashboard statistics
    const stats = [
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
            value: "2",
            icon: <Calendar className="w-5 h-5 text-accent-green" />,
            color: "bg-green-50 text-green-700",
        },
        {
            label: "Course Progress",
            value: "68%",
            icon: <BarChart3 className="w-5 h-5 text-accent-red" />,
            color: "bg-red-50 text-red-700",
        },
    ]

    // Mock data for upcoming events
    const upcomingEvents = [
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

    // Mock data for recent activity
    const recentActivity = [
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
        <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome section */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name || "Student"}</h1>
                    <p className="text-gray-600 mt-1">Here's an overview of your learning progress</p>
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
                                {user.avatar ? (
                                    <Image
                                        src={user.avatar}
                                        alt={user.name || "User"}
                                        width={64}
                                        height={64}
                                        className="rounded-full border border-gray-200"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-semibold">
                                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                )}
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <p className="text-sm text-gray-500 capitalize">{user.role || "student"}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-500">Course Completion</span>
                                    <span className="text-sm font-medium text-gray-900">68%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: "68%" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white overflow-hidden shadow-card rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                                <Link href="/dashboard/calendar" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                                    View all <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {upcomingEvents.map((event, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="p-2 rounded-md bg-gray-100 text-gray-600">
                                                {event.icon}
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                                            <div className="flex items-center mt-1">
                                                <Clock className="w-3 h-3 text-gray-500 mr-1" />
                                                <p className="text-xs text-gray-500">{event.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white overflow-hidden shadow-card rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                                <Link href="/dashboard/activity" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                                    View all <ArrowRight className="ml-1 w-4 h-4" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="flex-shrink-0 mt-1">
                                            {activity.icon}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
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
                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors duration-200">My Classes</h3>
                                        <p className="text-sm text-gray-500">View your enrolled courses</p>
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
                                        <p className="text-sm text-gray-500">Check your pending tasks</p>
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
                                        <p className="text-sm text-gray-500">Schedule and join meetings</p>
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