import { Metadata } from "next"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import { getUpcomingMeetings, getPastMeetings } from "@/lib/meeting-actions"
import {
    Calendar,
    Plus,
    Video,
    Users,
    BookOpen,
    ArrowLeft
} from "lucide-react"
import { Suspense } from "react"

import { MeetingsSearchFilter } from "@/components/MeetingsSearchFilter.jsx"
import { FilteredMeetings } from "@/components/FilteredMeetings.jsx"

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
    displayDate: string;
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

        console.log('Display Time of meetings:', upcomingMeetings.map(meeting => meeting.displayDate))

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

                {/* Search and Filter - Client Component */}
                <Suspense fallback={<div>Loading filters...</div>}>
                    <MeetingsSearchFilter
                        upcomingMeetings={upcomingMeetings}
                        isTeacher={isTeacher}
                    />
                </Suspense>

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

                {/* Filtered Meetings - Client Component */}
                <Suspense fallback={<div>Loading meetings...</div>}>
                    <FilteredMeetings
                        upcomingMeetings={upcomingMeetings}
                        pastMeetings={pastMeetings}
                        isTeacher={isTeacher}
                    />
                </Suspense>

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