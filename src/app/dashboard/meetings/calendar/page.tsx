import { Metadata } from "next"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import { getMeetingsForCalendar } from "@/lib/meeting-actions"
import { Avatar } from "@/components/Avatar"
import { CalendarMeeting } from "@/types/meetings"
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Video,
    MapPin,
} from "lucide-react"

export const metadata: Metadata = {
    title: "Meeting Calendar | English Learning Center",
    description: "View and manage your scheduled meetings in calendar format",
}

export const dynamic = 'force-dynamic'

// Helper function to safely parse date params
function getDateFromParams(month: string | undefined, year: string | undefined): Date {
    const currentDate = new Date()

    try {
        // Validate month
        const monthNum = month ? parseInt(month) : currentDate.getMonth() + 1
        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return currentDate
        }

        // Validate year
        const yearNum = year ? parseInt(year) : currentDate.getFullYear()
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
            return currentDate
        }

        // Create and validate the date
        const date = new Date(yearNum, monthNum - 1)
        return isNaN(date.getTime()) ? currentDate : date
    } catch (error) {
        console.error('Error parsing date params:', error)
        return currentDate
    }
}

interface CalendarDay {
    date: number
    isCurrentMonth: boolean
    events: CalendarMeeting[]
    isToday: boolean
}

export default async function MeetingCalendarPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Get the display date using the helper function with individual params
    const month = Array.isArray(searchParams.month) ? searchParams.month[0] : searchParams.month
    const year = Array.isArray(searchParams.year) ? searchParams.year[0] : searchParams.year
    const displayDate = getDateFromParams(month, year)
    const currentDate = new Date()

    const currentMonth = displayDate.toLocaleString('default', { month: 'long' })
    const currentYear = displayDate.getFullYear()

    // Get meetings from the database
    const meetings = await getMeetingsForCalendar()
    console.log('Fetched meetings:', meetings) // Debug log

    // Calculate the first day of the month and the number of days to display before it
    const firstDayOfMonth = new Date(currentYear, displayDate.getMonth(), 1)
    const startingDayOfWeek = firstDayOfMonth.getDay() // 0 for Sunday, 1 for Monday, etc.

    // Calculate the number of days in the current month
    const daysInMonth = new Date(currentYear, displayDate.getMonth() + 1, 0).getDate()

    // Calculate the number of days in the previous month
    const daysInPrevMonth = new Date(currentYear, displayDate.getMonth(), 0).getDate()

    // Calculate next and previous month/year
    const prevDate = new Date(displayDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    const prevMonth = prevDate.getMonth() + 1
    const prevYear = prevDate.getFullYear()

    const nextDate = new Date(displayDate)
    nextDate.setMonth(nextDate.getMonth() + 1)
    const nextMonth = nextDate.getMonth() + 1
    const nextYear = nextDate.getFullYear()

    // Generate calendar days
    const calendarDays: CalendarDay[] = Array.from({ length: 42 }, (_, i) => {
        const day = i - startingDayOfWeek + 1 // Adjust to start from the correct day of week
        const isCurrentMonth = day > 0 && day <= daysInMonth
        const date = isCurrentMonth
            ? day
            : (day <= 0 ? daysInPrevMonth + day : day - daysInMonth)

        // Get events for this day
        const dayEvents = meetings.filter(meeting => {
            // For the current implementation, we only need to match the day
            // since meetings are already filtered by month in the backend
            return meeting.day === date && isCurrentMonth
        })

        console.log(`Day ${date}, isCurrentMonth: ${isCurrentMonth}, events:`, dayEvents) // Debug log

        return {
            date,
            isCurrentMonth,
            events: dayEvents,
            isToday: isCurrentMonth &&
                currentDate.getDate() === date &&
                currentDate.getMonth() === displayDate.getMonth() &&
                currentDate.getFullYear() === displayDate.getFullYear()
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
                        <Link
                            href={`/dashboard/meetings/calendar?month=${prevMonth}&year=${prevYear}`}
                            className="p-2 rounded-md hover:bg-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <Link
                            href={`/dashboard/meetings/calendar?month=${nextMonth}&year=${nextYear}`}
                            className="p-2 rounded-md hover:bg-gray-100"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </Link>
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
                                className={`min-h-[120px] p-2 border-b border-r border-gray-200 
                                    ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''} 
                                    ${index % 7 === 6 ? 'border-r-0' : ''}
                                    ${day.isToday ? 'bg-primary-50' : ''}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-sm font-medium 
                                        ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                                        ${day.isToday ? 'text-primary-700' : ''}`}
                                    >
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
                                        <Link
                                            key={eventIndex}
                                            href={`/dashboard/meetings/${event.id}`}
                                            className={`text-xs p-1.5 rounded truncate block hover:opacity-75 transition-opacity
                                                ${event.type === 'ONE_ON_ONE'
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
                                                <span className="truncate font-medium">{event.time}</span>
                                            </div>
                                            <div className="truncate pl-4 mt-0.5">
                                                <div className="flex items-center gap-1">
                                                    {event.teacher && (
                                                        <Avatar
                                                            url={event.teacher.image}
                                                            name={event.teacher.name}
                                                            size="sm"
                                                            className="w-4 h-4"
                                                        />
                                                    )}
                                                    <span>{event.title}</span>
                                                </div>
                                            </div>
                                        </Link>
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