import { Metadata } from "next"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Video,
    MapPin,
    Users
} from "lucide-react"

export const metadata: Metadata = {
    title: "Meeting Calendar | English Learning Center",
    description: "View your scheduled meetings in calendar format",
}

export const dynamic = 'force-dynamic'

export default async function MeetingCalendarPage() {
    // Get authenticated user
    const user = await requireServerAuth()

    // Mock data for current month and year
    const currentMonth = "March"
    const currentYear = 2024

    // Mock data for calendar days
    const calendarDays = Array.from({ length: 35 }, (_, i) => {
        const day = i - 3 // Start from Feb 27 (3 days before March 1)
        const isCurrentMonth = day > 0 && day <= 31
        const date = isCurrentMonth ? day : (day <= 0 ? 28 + day : day - 31)

        return {
            date,
            isCurrentMonth,
            events: getMockEventsForDay(day, isCurrentMonth)
        }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button */}
            <div className="mb-6">
                <Link
                    href="/dashboard/meetings"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Meetings
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Meeting Calendar</h1>
                <p className="text-gray-600">
                    View and manage your scheduled meetings in calendar format
                </p>
            </div>

            {/* Calendar Header */}
            <div className="bg-white rounded-lg shadow-card mb-6">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-primary-600 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900">{currentMonth} {currentYear}</h2>
                    </div>
                    <div className="flex space-x-2">
                        <button className="p-2 rounded-md hover:bg-gray-100">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="p-2 rounded-md hover:bg-gray-100">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="border-t border-gray-200">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-sm font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 auto-rows-fr">
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                className={`min-h-[120px] p-2 border-b border-r border-gray-200 ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                                    } ${index % 7 === 6 ? 'border-r-0' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-medium ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {day.date}
                                    </span>
                                    {day.events.length > 0 && (
                                        <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5">
                                            {day.events.length}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-1 space-y-1">
                                    {day.events.map((event, eventIndex) => (
                                        <div
                                            key={eventIndex}
                                            className={`text-xs p-1 rounded truncate ${event.type === 'one-on-one'
                                                    ? 'bg-primary-50 text-primary-700 border-l-2 border-primary-500'
                                                    : 'bg-yellow-50 text-yellow-700 border-l-2 border-yellow-500'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                {event.isOnline ? (
                                                    <Video className="w-3 h-3 mr-1 flex-shrink-0" />
                                                ) : (
                                                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                                )}
                                                <span className="truncate">{event.time} {event.title}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-card p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-primary-100 border-l-2 border-primary-500 mr-2"></div>
                        <span className="text-sm text-gray-600">One-on-One Session</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-100 border-l-2 border-yellow-500 mr-2"></div>
                        <span className="text-sm text-gray-600">Group Session</span>
                    </div>
                    <div className="flex items-center">
                        <Video className="w-4 h-4 text-primary-600 mr-2" />
                        <span className="text-sm text-gray-600">Online Meeting</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-accent-red mr-2" />
                        <span className="text-sm text-gray-600">In-Person Meeting</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
                <Link href="/dashboard/meetings/schedule" className="btn btn-primary">
                    Schedule New Meeting
                </Link>
                <Link href="/dashboard/meetings" className="btn btn-outline">
                    List View
                </Link>
            </div>
        </div>
    )
}

// Helper function to generate mock events for a specific day
function getMockEventsForDay(day: number, isCurrentMonth: boolean) {
    if (!isCurrentMonth) return []

    const events = []

    // March 1 - IELTS Speaking Practice
    if (day === 1) {
        events.push({
            title: "IELTS Speaking",
            time: "3:00 PM",
            type: "one-on-one",
            isOnline: true
        })
    }

    // March 2 - TOEIC Grammar Consultation
    if (day === 2) {
        events.push({
            title: "TOEIC Grammar",
            time: "2:00 PM",
            type: "one-on-one",
            isOnline: false
        })
    }

    // March 3 - IELTS Reading Strategies
    if (day === 3) {
        events.push({
            title: "IELTS Reading",
            time: "6:00 PM",
            type: "group",
            isOnline: true
        })
    }

    // March 5 - Pronunciation Workshop
    if (day === 5) {
        events.push({
            title: "Pronunciation",
            time: "5:00 PM",
            type: "group",
            isOnline: false
        })
    }

    // March 7 - TOEIC Listening
    if (day === 7) {
        events.push({
            title: "TOEIC Listening",
            time: "4:30 PM",
            type: "group",
            isOnline: true
        })
    }

    // March 10 - Writing Feedback
    if (day === 10) {
        events.push({
            title: "Writing Feedback",
            time: "2:00 PM",
            type: "one-on-one",
            isOnline: false
        })
    }

    // March 15 - Mock IELTS Test
    if (day === 15) {
        events.push({
            title: "Mock IELTS Test",
            time: "9:00 AM",
            type: "group",
            isOnline: false
        })
        events.push({
            title: "Speaking Review",
            time: "3:00 PM",
            type: "one-on-one",
            isOnline: true
        })
    }

    return events
} 