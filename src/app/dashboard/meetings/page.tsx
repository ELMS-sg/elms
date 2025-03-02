import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import { getUpcomingMeetings, getPastMeetings, getAvailableMeetings } from "@/lib/meeting-actions"
import {
    Calendar,
    Clock,
    Users,
    Search,
    Filter,
    Plus,
    Video,
    MapPin,
    ChevronRight,
    CheckCircle,
    X,
    MessageSquare,
    BookOpen
} from "lucide-react"

export const metadata: Metadata = {
    title: "Meetings | English Learning Center",
    description: "View and manage your scheduled meetings and consultations",
}

export const dynamic = 'force-dynamic'

export default async function MeetingsPage() {
    // Get the authenticated user
    const user = await requireServerAuth()

    // Get upcoming and past meetings
    const upcomingMeetings = await getUpcomingMeetings()
    const pastMeetings = await getPastMeetings()

    // Get available meeting slots
    const availableMeetings = await getAvailableMeetings()

    // Calculate counts for categories
    const oneOnOneCount = [...upcomingMeetings, ...availableMeetings].filter(m => m.type === "ONE_ON_ONE").length
    const groupCount = [...upcomingMeetings, ...availableMeetings].filter(m => m.type === "GROUP").length

    // Meeting categories
    const categories = [
        { name: "All Meetings", count: upcomingMeetings.length + availableMeetings.length, active: true },
        { name: "Upcoming", count: upcomingMeetings.length, active: false },
        { name: "Available", count: availableMeetings.length, active: false },
        { name: "One-on-One", count: oneOnOneCount, active: false },
        { name: "Group", count: groupCount, active: false },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Meetings</h1>
                <p className="text-gray-600">
                    Manage your scheduled consultations and practice sessions
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
                            placeholder="Search meetings..."
                        />
                    </div>
                    <button className="btn btn-outline flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Calendar View Button */}
            <div className="flex justify-end mb-6">
                <Link href="/dashboard/meetings/calendar" className="btn btn-outline flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar View
                </Link>
            </div>

            {/* Upcoming Meetings Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Upcoming Meetings</h2>
                    <Link href="/dashboard/meetings/upcoming" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                        View all <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingMeetings.map((meeting) => (
                        <div
                            key={meeting.id}
                            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
                        >
                            <div className="p-5 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-md ${meeting.type === "ONE_ON_ONE"
                                            ? "bg-primary-50 text-primary-600"
                                            : "bg-yellow-50 text-yellow-600"
                                            }`}>
                                            {meeting.type === "ONE_ON_ONE" ? (
                                                <Users className="h-5 w-5" />
                                            ) : (
                                                <Users className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span className="ml-2 text-sm font-medium text-gray-500">
                                            {meeting.type === "ONE_ON_ONE" ? "One-on-One" : "Group Session"}
                                        </span>
                                    </div>
                                    <span className={`badge ${meeting.status === "confirmed"
                                        ? "badge-success"
                                        : "badge-warning"
                                        }`}>
                                        {meeting.status === "confirmed" ? "Confirmed" : "Pending"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {meeting.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {meeting.description}
                                </p>

                                <div className="mt-auto">
                                    <div className="flex items-center mb-3">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={meeting.teacher.image}
                                                alt={meeting.teacher.name}
                                                width={36}
                                                height={36}
                                                className="rounded-full"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{meeting.teacher.name}</p>
                                            <p className="text-xs text-gray-500">{meeting.teacher.title}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>{meeting.startTime} - {meeting.endTime} ({meeting.duration})</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        {meeting.isOnline ? (
                                            <>
                                                <Video className="h-4 w-4 mr-2 text-primary-600" />
                                                <span>Online Meeting</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="h-4 w-4 mr-2 text-accent-red" />
                                                <span>{meeting.location}</span>
                                            </>
                                        )}
                                    </div>

                                    {meeting.type === "GROUP" && (
                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span>{meeting.participants} / {meeting.maxParticipants} Participants</span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm text-gray-500 mb-0">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        <span>Related to: {meeting.relatedClass.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 mt-auto">
                                <div className="grid grid-cols-12 gap-2">
                                    {meeting.isOnline ? (
                                        <>
                                            <Link
                                                href={meeting.meetingLink || "#"}
                                                className="col-span-5 btn btn-primary btn-sm flex items-center justify-center"
                                            >
                                                <Video className="w-4 h-4 mr-2" />
                                                Join Meeting
                                            </Link>
                                            <button className="col-span-5 btn btn-outline btn-sm flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 mr-2" />
                                                Contact Teacher
                                            </button>
                                        </>
                                    ) : (
                                        <button className="col-span-10 btn btn-outline btn-sm flex items-center justify-center">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Contact Teacher
                                        </button>
                                    )}
                                    <button className="col-span-2 btn btn-outline btn-sm flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Available Meeting Slots Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Available Meeting Slots</h2>
                    <Link href="/dashboard/meetings/available" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                        View all <ChevronRight className="ml-1 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableMeetings.map((meeting) => (
                        <div
                            key={meeting.id}
                            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
                        >
                            <div className="p-5 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-md ${meeting.type === "ONE_ON_ONE"
                                            ? "bg-primary-50 text-primary-600"
                                            : "bg-yellow-50 text-yellow-600"
                                            }`}>
                                            {meeting.type === "ONE_ON_ONE" ? (
                                                <Users className="h-5 w-5" />
                                            ) : (
                                                <Users className="h-5 w-5" />
                                            )}
                                        </div>
                                        <span className="ml-2 text-sm font-medium text-gray-500">
                                            {meeting.type === "ONE_ON_ONE" ? "One-on-One" : "Group Session"}
                                        </span>
                                    </div>
                                    <span className="badge badge-outline text-primary-600 border-primary-200">
                                        {meeting.availableSlots} {meeting.availableSlots === 1 ? "slot" : "slots"} available
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {meeting.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {meeting.description}
                                </p>

                                <div className="mt-auto">
                                    <div className="flex items-center mb-3">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={meeting.teacher.image}
                                                alt={meeting.teacher.name}
                                                width={36}
                                                height={36}
                                                className="rounded-full"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{meeting.teacher.name}</p>
                                            <p className="text-xs text-gray-500">{meeting.teacher.title}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span>{meeting.startTime} - {meeting.endTime} ({meeting.duration})</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500 mb-3">
                                        {meeting.isOnline ? (
                                            <>
                                                <Video className="h-4 w-4 mr-2 text-primary-600" />
                                                <span>Online Meeting</span>
                                            </>
                                        ) : (
                                            <>
                                                <MapPin className="h-4 w-4 mr-2 text-accent-red" />
                                                <span>{meeting.location}</span>
                                            </>
                                        )}
                                    </div>

                                    {meeting.type === "GROUP" && (
                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span>{meeting.availableSlots} / {meeting.maxParticipants} Slots Available</span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm text-gray-500 mb-0">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        <span>Related to: {meeting.relatedClass.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 mt-auto">
                                <div className="grid grid-cols-12 gap-2">
                                    <button className="col-span-12 btn btn-primary flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Book This Slot
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Schedule New Meeting */}
            <div className="bg-white rounded-lg shadow-card p-6 text-center mb-10">
                <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-4">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Need Additional Support?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                        Schedule a personalized one-on-one session with our IELTS or TOEIC specialists to address your specific learning needs.
                    </p>
                </div>
                <Link href="/dashboard/meetings/schedule" className="btn btn-primary inline-flex items-center">
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule New Meeting
                </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-primary-50 text-primary-600 mr-4">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Upcoming Meetings</p>
                            <p className="text-xl font-semibold text-gray-900">{upcomingMeetings.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-green-50 text-green-600 mr-4">
                            <Video className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Online Sessions</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {[...upcomingMeetings, ...availableMeetings].filter(m => m.isOnline).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-yellow-50 text-yellow-600 mr-4">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">In-Person Sessions</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {[...upcomingMeetings, ...availableMeetings].filter(m => !m.isOnline).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-red-50 text-red-600 mr-4">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Hours</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {calculateTotalHours(upcomingMeetings)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper function to calculate total hours from meetings
function calculateTotalHours(meetings) {
    return meetings.reduce((total, meeting) => {
        // Extract hours from duration string (e.g., "1 hour", "1.5 hours")
        const durationMatch = meeting.duration.match(/(\d+(\.\d+)?)/)
        if (durationMatch) {
            return total + parseFloat(durationMatch[1])
        }
        return total
    }, 0)
} 