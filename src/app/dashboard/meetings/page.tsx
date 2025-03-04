import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import { getUpcomingMeetings, getPastMeetings } from "@/lib/meeting-actions"
import { Avatar } from "@/components/Avatar"
import {
    Calendar,
    Clock,
    Users,
    Search,
    Plus,
    Video,
    X,
    BookOpen,
    ExternalLink,
    ArrowLeft
} from "lucide-react"

// Define meeting types
type MeetingType = "ONE_ON_ONE" | "GROUP"

interface Teacher {
    name: string;
    avatar_url: string;
    title: string;
}

interface RelatedClass {
    id: string;
    name: string;
}

interface Meeting {
    id: string;
    title: string;
    description?: string;
    teacher: Teacher;
    type: MeetingType;
    startTime: string;
    endTime: string;
    duration: string;
    meetingLink?: string;
    meetingId?: string;
    relatedClass: RelatedClass;
    participants?: number;
    maxParticipants?: number;
    notes?: string;
    studentName?: string;
}

export const metadata: Metadata = {
    title: "Meetings | English Learning Center",
    description: "View and manage your scheduled meetings and consultations",
}

export default async function MeetingsPage() {
    try {
        // Get the authenticated user
        const user = await requireServerAuth()
        const isTeacher = user.role === 'TEACHER'

        // Get upcoming and past meetings with error handling
        let upcomingMeetings: Meeting[] = []
        let pastMeetings: Meeting[] = []

        try {
            upcomingMeetings = await getUpcomingMeetings() as unknown as Meeting[]
            console.log(`Fetched ${upcomingMeetings.length} upcoming meetings`)
        } catch (error) {
            console.error('Error fetching upcoming meetings:', error)
            upcomingMeetings = []
        }

        try {
            pastMeetings = await getPastMeetings() as unknown as Meeting[]
            console.log(`Fetched ${pastMeetings.length} past meetings`)
        } catch (error) {
            console.error('Error fetching past meetings:', error)
            pastMeetings = []
        }

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {isTeacher ? "Manage Meetings" : "My Meetings"}
                    </h1>
                    <p className="text-gray-600">
                        {isTeacher
                            ? "Create and manage Zoom meetings for your classes and students"
                            : "View and join your scheduled Zoom meetings"}
                    </p>
                </div>

                {/* Teacher-specific Quick Actions */}
                {isTeacher && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Link href="/dashboard/meetings/create" className="bg-white rounded-lg shadow-card p-4 flex items-center hover:shadow-card-hover transition-shadow duration-300">
                            <div className="p-3 rounded-full bg-primary-50 text-primary-600 mr-3">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Create Meeting</h3>
                                <p className="text-sm text-gray-500">Schedule a new Zoom meeting</p>
                            </div>
                        </Link>
                        <Link href="/dashboard/meetings/calendar" className="bg-white rounded-lg shadow-card p-4 flex items-center hover:shadow-card-hover transition-shadow duration-300">
                            <div className="p-3 rounded-full bg-green-50 text-green-600 mr-3">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Meeting Calendar</h3>
                                <p className="text-sm text-gray-500">View your meeting schedule</p>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-primary-100 text-primary-700">
                            All Meetings
                            <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-white text-gray-500">
                                {upcomingMeetings.length}
                            </span>
                        </button>
                        <button className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-white text-gray-600 hover:bg-gray-50">
                            One-on-One
                            <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-white text-gray-500">
                                {upcomingMeetings.filter(m => m.type === "ONE_ON_ONE").length}
                            </span>
                        </button>
                        <button className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-white text-gray-600 hover:bg-gray-50">
                            Group
                            <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-white text-gray-500">
                                {upcomingMeetings.filter(m => m.type === "GROUP").length}
                            </span>
                        </button>
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
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    {isTeacher && (
                        <Link href="/dashboard/meetings/create" className="btn btn-primary flex items-center mr-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Meeting
                        </Link>
                    )}
                    <Link href="/dashboard/meetings/calendar" className="btn btn-outline flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendar View
                    </Link>
                </div>

                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Upcoming Meetings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingMeetings.length > 0 ? (
                            upcomingMeetings.map((meeting) => (
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
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-gray-500">
                                                    {meeting.type === "ONE_ON_ONE" ? "One-on-One" : "Group Session"}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {meeting.title}
                                        </h3>

                                        {meeting.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {meeting.description}
                                            </p>
                                        )}

                                        <div className="mt-auto">
                                            <div className="flex items-center mb-3">
                                                <Avatar
                                                    url={meeting.teacher.avatar_url}
                                                    name={meeting.teacher.name}
                                                    size="sm"
                                                />
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
                                                <Video className="h-4 w-4 mr-2 text-primary-600" />
                                                <span>Zoom Meeting</span>
                                            </div>

                                            {meeting.type === "ONE_ON_ONE" && meeting.studentName && (
                                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    <span>With: {meeting.studentName}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm text-gray-500 mb-0">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                <span>Class: {meeting.relatedClass.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 mt-auto">
                                        <div className="grid grid-cols-12 gap-2">
                                            <a
                                                href={meeting.meetingLink || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="col-span-8 btn btn-primary btn-sm flex items-center justify-center"
                                            >
                                                <Video className="w-4 h-4 mr-2" />
                                                Join Zoom Meeting
                                            </a>
                                            <button className="col-span-4 btn btn-outline btn-sm flex items-center justify-center text-red-600 border-red-200 hover:bg-red-50">
                                                <X className="w-4 h-4 mr-2" />
                                                Cancel
                                            </button>
                                        </div>
                                        {isTeacher && meeting.meetingId && (
                                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                                                <span className="mr-1">Zoom Meeting ID:</span>
                                                <span className="font-medium">{meeting.meetingId}</span>
                                                {meeting.meetingLink && (
                                                    <a
                                                        href={meeting.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-auto text-primary-600 hover:text-primary-700 flex items-center"
                                                    >
                                                        Edit <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) :
                            (
                                <div className="col-span-3 py-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                        <Calendar className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Meetings</h3>
                                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                                        {isTeacher
                                            ? "You don't have any scheduled meetings. Create a new Zoom meeting to get started."
                                            : "You don't have any upcoming meetings scheduled."}
                                    </p>
                                    {isTeacher && (
                                        <Link href="/dashboard/meetings/create" className="btn btn-primary">
                                            Create Meeting
                                        </Link>
                                    )}
                                </div>
                            )}
                    </div>
                </div>

                {/* Past Meetings Section */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Past Meetings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastMeetings.length > 0 ? (
                            pastMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full opacity-75"
                                >
                                    <div className="p-5 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-md ${meeting.type === "ONE_ON_ONE"
                                                    ? "bg-primary-50 text-primary-600"
                                                    : "bg-yellow-50 text-yellow-600"
                                                    }`}>
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-gray-500">
                                                    {meeting.type === "ONE_ON_ONE" ? "One-on-One" : "Group Session"}
                                                </span>
                                            </div>
                                            <span className="badge badge-outline">Completed</span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {meeting.title}
                                        </h3>

                                        {meeting.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {meeting.description}
                                            </p>
                                        )}

                                        <div className="mt-auto">
                                            <div className="flex items-center mb-3">
                                                <Avatar
                                                    url={meeting.teacher.avatar_url}
                                                    name={meeting.teacher.name}
                                                    size="sm"
                                                />
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{meeting.teacher.name}</p>
                                                    <p className="text-xs text-gray-500">{meeting.teacher.title}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <Clock className="h-4 w-4 mr-2" />
                                                <span>{meeting.startTime} - {meeting.endTime} ({meeting.duration})</span>
                                            </div>

                                            {meeting.type === "ONE_ON_ONE" && meeting.studentName && (
                                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    <span>With: {meeting.studentName}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm text-gray-500 mb-0">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                <span>Class: {meeting.relatedClass.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 mt-auto">
                                        {isTeacher && (
                                            <button className="w-full btn btn-outline btn-sm flex items-center justify-center">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Schedule Similar Meeting
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-8 text-center">
                                <p className="text-gray-600">No past meetings found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Meeting CTA for Students */}
                {!isTeacher && (
                    <div className="bg-white rounded-lg shadow-card p-6 text-center mb-10">
                        <div className="mb-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-4">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Need Additional Support?</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                                Request a one-on-one session with your teacher to address your specific learning needs.
                            </p>
                        </div>
                        <Link href="/dashboard/meetings/request" className="btn btn-primary inline-flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Request Meeting
                        </Link>
                    </div>
                )}

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <p className="text-sm text-gray-500">One-on-One Sessions</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {upcomingMeetings.filter(m => m.type === "ONE_ON_ONE").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-card p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-yellow-50 text-yellow-600 mr-4">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Group Sessions</p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {upcomingMeetings.filter(m => m.type === "GROUP").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } catch (error) {
        console.error('Error in MeetingsPage:', error)
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p>An error occurred while loading the meetings page. Please try again later.</p>
                </div>
                <Link href="/dashboard" className="btn btn-outline flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>
        )
    }
} 