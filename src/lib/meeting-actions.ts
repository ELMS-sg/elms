'use server'

import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { requireServerAuth } from './actions'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { Database } from '@/types/supabase'
import { CalendarMeeting, MeetingType, MeetingStatus, Teacher, RelatedClass } from "@/types/meetings"
import { formatDate, formatDisplayDate, formatTime, generateRecurringMeetings, formatMeetingDuration, parseSchedule } from './utils'

// Helper function to get Supabase client - cached to avoid multiple instantiations
const getSupabase = cache(() => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

// Database response types
type TeacherData = {
    id: string;
} & Teacher;

type ClassData = RelatedClass;

type MeetingData = {
    id: string;
    title: string;
    description: string;
    type: string;
    start_time: string;
    end_time: string;
    duration: string;
    is_online: boolean;
    meeting_link: string | null;
    location: string | null;
    status: string;
    max_participants: number | null;
    participants_count: number | null;
    available_slots: number | null;
    teacher_id: TeacherData;
    class_id: ClassData | null;
};

// Mock data store for meetings when we can't access the database due to RLS
// This is a temporary solution for development only
interface MockMeeting {
    id: string;
    title: string;
    description: string;
    type: MeetingType;
    start_time: string;
    end_time: string;
    is_online: boolean;
    meeting_link: string | null;
    location: string | null;
    status: MeetingStatus;
    max_participants: number | null;
    teacher_id: string;
    class_id: string | null;
    student_id: string | null;
    created_at: string;
}

export interface Meeting {
    id: string
    title: string
    description?: string
    teacher: {
        name: string
        avatar_url: string
        title: string
    }
    type: "ONE_ON_ONE" | "GROUP"
    date: string          // YYYY-MM-DD format for sorting
    displayDate: string   // Formatted date for display
    startTime: string
    endTime: string
    duration: string
    isOnline: boolean
    status: string
    meetingLink?: string
    meetingId?: string
    location?: string
    relatedClass: {
        id: string
        name: string
    }
    participants?: number
    maxParticipants?: number
    notes?: string
    studentName?: string
}

/**
 * Get upcoming meetings for the current user
 */
export async function getUpcomingMeetings(): Promise<Meeting[]> {
    const user = await requireServerAuth()
    const supabase = getSupabase()
    const now = new Date()

    console.log("UPCOMING MEETINGS CALLED!!!")

    try {
        // Get one-on-one meetings
        const { data: oneOnOneMeetings, error: oneOnOneError } = await supabase
            .from('meetings')
            .select(`
                id,
                title,
                description,
                type,
                start_time,
                end_time,
                duration,
                is_online,
                meeting_link,
                location,
                status,
                max_participants,
                participants_count,
                teacher_id(id, name, avatar_url, title),
                class_id(id, name)
            `)
            .eq('type', 'ONE_ON_ONE')
            .gte('start_time', now.toISOString())
            // Filter based on user role
            .or(
                user.role === 'TEACHER'
                    ? `teacher_id.eq.${user.id}`  // For teachers, only show their meetings
                    : `student_id.eq.${user.id}`  // For students, only show meetings they're enrolled in
            )
            .order('start_time', { ascending: true });

        if (oneOnOneError) {
            console.error('Error fetching one-on-one meetings:', oneOnOneError);
        }

        // First, get all classes the user is involved with
        let classesQuery;
        if (user.role === 'TEACHER') {
            classesQuery = supabase
                .from('classes')
                .select(`
                    id,
                    name,
                    description,
                    start_date,
                    end_date,
                    meeting_url,
                    schedule
                `)
                .eq('teacher_id', user.id)
        } else {
            classesQuery = supabase
                .from('class_enrollments')
                .select(`
                    classes (
                        id,
                        name,
                        description,
                        start_date,
                        end_date,
                        meeting_url,
                        schedule,
                        users!classes_teacher_id_fkey (
                            id,
                            name,
                            avatar_url
                        )
                    )
                `)
                .eq('student_id', user.id)
        }

        const { data: classesData, error: classesError } = await classesQuery

        if (classesError) {
            console.error('Error fetching classes:', classesError)
            return []
        }

        const meetings: Meeting[] = []

        // Add one-on-one meetings if any
        if (oneOnOneMeetings) {
            oneOnOneMeetings.forEach(meeting => {
                const startDate = new Date(meeting.start_time);
                const teacherData = meeting.teacher_id as unknown as {
                    name: string;
                    avatar_url: string;
                    title: string;
                };
                const classData = meeting.class_id as unknown as {
                    id: string;
                    name: string;
                };

                meetings.push({
                    id: meeting.id,
                    title: meeting.title,
                    description: meeting.description,
                    teacher: {
                        name: teacherData?.name || 'Unknown Teacher',
                        avatar_url: teacherData?.avatar_url || '/images/default-avatar.jpg',
                        title: teacherData?.title || 'Teacher'
                    },
                    type: "ONE_ON_ONE",
                    date: formatDate(startDate),
                    displayDate: formatDisplayDate(startDate),
                    startTime: formatTime(meeting.start_time),
                    endTime: formatTime(meeting.end_time),
                    duration: meeting.duration,
                    isOnline: meeting.is_online,
                    status: meeting.status,
                    meetingLink: meeting.meeting_link,
                    location: meeting.location,
                    relatedClass: classData ? {
                        id: classData.id,
                        name: classData.name
                    } : null
                });
            });
        }

        // Process recurring class meetings
        console.log("CLASS DATA", classesData)

        for (const classItem of classesData) {
            const classData = user.role === 'TEACHER' ? classItem : classItem.classes
            console.log("Processing class:", {
                id: classData.id,
                name: classData.name,
                schedule: classData.schedule,
                start_date: classData.start_date,
                end_date: classData.end_date
            });

            const teacher = user.role === 'TEACHER'
                ? { name: user.name, avatar_url: user.avatar_url, title: "Senior Instructor" }
                : {
                    name: (classData.users as any).name,
                    avatar_url: (classData.users as any).avatar_url,
                    title: "Senior Instructor"
                }

            if (classData.schedule) {
                console.log("Processing schedule:", classData.schedule);
                const { days, startTime, duration } = parseSchedule(classData.schedule)
                console.log("Parsed schedule:", { days, startTime, duration });

                const meetingDates = generateRecurringMeetings(
                    new Date(classData.start_date),
                    new Date(classData.end_date),
                    days,
                    startTime
                )

                console.log("Generated meeting dates:", meetingDates)

                // Filter for upcoming meetings only
                const upcomingDates = meetingDates.filter(date => {
                    const isUpcoming = date > now;
                    console.log("Checking date:", date, "Is upcoming:", isUpcoming, "Current time:", now);
                    return isUpcoming;
                })

                console.log("Upcoming dates:", upcomingDates)

                // Create meeting objects for each date
                upcomingDates.forEach(date => {
                    const startTime = new Date(date)
                    const endTime = new Date(date)
                    endTime.setMinutes(endTime.getMinutes() + duration)

                    const meeting: Meeting = {
                        id: `${classData.id}-${date.getTime()}`,
                        title: `${classData.name} - Regular Class`,
                        description: classData.description,
                        teacher,
                        type: "GROUP" as const,
                        date: formatDate(date),
                        displayDate: formatDisplayDate(date),
                        startTime: formatTime(startTime),
                        endTime: formatTime(endTime),
                        duration: formatMeetingDuration(
                            startTime.toTimeString().slice(0, 5),
                            endTime.toTimeString().slice(0, 5)
                        ),
                        isOnline: true,
                        status: 'scheduled',
                        meetingLink: classData.meeting_url,
                        relatedClass: {
                            id: classData.id,
                            name: classData.name
                        }
                    };
                    console.log("Created meeting:", meeting);
                    meetings.push(meeting)
                })
            }
        }

        console.log("All meetings before sort:", meetings);

        // Sort meetings by date and time
        let sortedMeetings = meetings.sort((a, b) => {
            // Parse the full date and time for comparison
            const dateA = new Date(a.date + ' ' + a.startTime);
            const dateB = new Date(b.date + ' ' + b.startTime);
            console.log('Comparing dates:', {
                a: { date: a.date, time: a.startTime, parsed: dateA },
                b: { date: b.date, time: b.startTime, parsed: dateB }
            });
            return dateA.getTime() - dateB.getTime();
        });

        console.log("Final sorted meetings:", sortedMeetings);
        return sortedMeetings;

    } catch (error) {
        console.error('Error in getUpcomingMeetings:', error);
        return [];
    }
}

/**
 * Get past meetings for the current user
 */
export async function getPastMeetings(): Promise<Meeting[]> {
    // Similar to getUpcomingMeetings but filter for past dates
    const user = await requireServerAuth()
    const supabase = getSupabase()
    const now = new Date()

    try {
        // Implementation similar to getUpcomingMeetings
        // but filter for dates < now instead of > now
        return []
    } catch (error) {
        console.error('Error in getPastMeetings:', error)
        return []
    }
}

/**
 * Get meeting details by ID
 */
export async function getMeetingById(meetingId: string): Promise<Meeting | null> {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    try {
        const { data, error } = await supabase
            .from('meetings')
            .select(`
                id,
                title,
                description,
                type,
                start_time,
                end_time,
                duration,
                is_online,
                meeting_link,
                location,
                status,
                max_participants,
                participants_count,
                teacher_id(id, name, avatar_url, title),
                class_id(id, name)
            `)
            .eq('id', meetingId)
            .single()

        if (error) {
            console.error('Error fetching meeting by ID:', error)
            return null
        }

        if (!data) {
            return null
        }

        // Format the data to match the expected structure
        const meeting = data as unknown as MeetingData
        const startDate = new Date(meeting.start_time)
        return {
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            teacher: {
                name: meeting.teacher_id?.name || 'Unknown Teacher',
                avatar_url: meeting.teacher_id?.avatar_url || '/images/default-avatar.jpg',
                title: meeting.teacher_id?.title || 'Teacher'
            },
            type: meeting.type as MeetingType,
            date: formatDate(startDate),
            displayDate: formatDisplayDate(startDate),
            startTime: formatTime(new Date(meeting.start_time)),
            endTime: formatTime(new Date(meeting.end_time)),
            duration: calculateDuration(meeting.start_time, meeting.end_time),
            isOnline: meeting.is_online,
            status: meeting.status as MeetingStatus,
            meetingLink: meeting.meeting_link,
            location: meeting.location,
            relatedClass: meeting.class_id ? {
                id: meeting.class_id.id,
                name: meeting.class_id.name
            } : null
        }
    } catch (error) {
        console.error('Error in getMeetingById:', error)
        return null
    }
}

/**
 * Schedule a new meeting
 */
export async function scheduleMeeting(meetingData: {
    title: string;
    description: string;
    type: MeetingType;
    startTime: string;
    endTime: string;
    isOnline: boolean;
    meetingLink?: string;
    location?: string;
    relatedClassId?: string;
    maxParticipants?: number;
    teacherId: string;
    studentId?: string;
}) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    try {
        const startTimeISO = new Date(meetingData.startTime).toISOString()
        const endTimeISO = new Date(meetingData.endTime).toISOString()

        const { data, error } = await supabase
            .from('meetings')
            .insert({
                title: meetingData.title,
                description: meetingData.description,
                type: meetingData.type,
                start_time: startTimeISO,
                end_time: endTimeISO,
                is_online: meetingData.isOnline,
                meeting_link: meetingData.meetingLink,
                location: meetingData.location,
                class_id: meetingData.relatedClassId,
                max_participants: meetingData.maxParticipants,
                teacher_id: meetingData.teacherId,
                student_id: meetingData.type === 'ONE_ON_ONE' ? meetingData.studentId : null,
                status: 'confirmed'
            })
            .select()
            .single()

        if (error) {
            console.error('Error scheduling meeting:', error)
            throw new Error('Failed to schedule meeting')
        }

        revalidatePath('/dashboard/meetings')

        return {
            id: data.id,
            title: data.title,
            status: data.status
        }
    } catch (error) {
        console.error('Error in scheduleMeeting:', error)
        throw new Error('Failed to schedule meeting')
    }
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(meetingId: string) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    try {
        // Update the meeting status to cancelled
        const { error } = await supabase
            .from('meetings')
            .update({ status: 'cancelled' })
            .eq('id', meetingId)
            .or(`student_id.eq.${user.id},teacher_id.eq.${user.id}`) // Only allow cancellation if user is student or teacher

        if (error) {
            console.error('Error cancelling meeting:', error)
            throw new Error('Failed to cancel meeting')
        }

        // Revalidate the meetings page to show the updated meeting list
        revalidatePath('/dashboard/meetings')

        return { success: true }
    } catch (error) {
        console.error('Error in cancelMeeting:', error)
        throw new Error('Failed to cancel meeting')
    }
}

/**
 * Join a group meeting
 */
export async function joinMeeting(meetingId: string) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    try {
        // Check if the user is already enrolled in this meeting
        const { data: existingEnrollment, error: checkError } = await supabase
            .from('meeting_participants')
            .select('id')
            .eq('meeting_id', meetingId)
            .eq('user_id', user.id)
            .single()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected
            console.error('Error checking meeting enrollment:', checkError)
            throw new Error('Failed to join meeting')
        }

        if (existingEnrollment) {
            // User is already enrolled
            return { success: true, message: 'Already enrolled in this meeting' }
        }

        // Add the user to the meeting participants
        const { error } = await supabase
            .from('meeting_participants')
            .insert({
                meeting_id: meetingId,
                user_id: user.id
            })

        if (error) {
            console.error('Error joining meeting:', error)
            throw new Error('Failed to join meeting')
        }

        // Revalidate the meetings page to show the updated meeting list
        revalidatePath('/dashboard/meetings')

        return { success: true }
    } catch (error) {
        console.error('Error in joinMeeting:', error)
        throw new Error('Failed to join meeting')
    }
}

/**
 * Get available teachers for scheduling meetings
 */
export async function getAvailableTeachers() {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id,
                name,
                avatar_url,
                title,
                specialties,
                rating,
                review_count
            `)
            .eq('role', 'TEACHER')
            .eq('is_available', true)

        if (error) {
            console.error('Error fetching available teachers:', error)
            return []
        }

        return data.map(teacher => ({
            id: teacher.id,
            name: teacher.name,
            avatar_url: teacher.avatar_url || '/images/default-avatar.jpg',
            title: teacher.title || 'Teacher',
            specialties: teacher.specialties || [],
            rating: teacher.rating || 4.5,
            reviewCount: teacher.review_count || 0
        }))
    } catch (error) {
        console.error('Error in getAvailableTeachers:', error)
        return []
    }
}

/**
 * Get teacher availability for scheduling
 */
export async function getTeacherAvailability(teacherId: string) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    try {
        const { data, error } = await supabase
            .from('teacher_availability')
            .select('date, slots')
            .eq('teacher_id', teacherId)
            .gte('date', new Date().toISOString().split('T')[0]) // Only future dates
            .order('date', { ascending: true })
            .limit(10) // Limit to next 10 available days

        if (error) {
            console.error('Error fetching teacher availability:', error)
            return []
        }

        return data.map(availability => ({
            date: availability.date,
            slots: availability.slots || []
        }))
    } catch (error) {
        console.error('Error in getTeacherAvailability:', error)
        return []
    }
}

/**
 * Get available meeting slots
 */
export async function getAvailableMeetings(): Promise<Meeting[]> {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    try {
        // Get current date in ISO format
        const now = new Date().toISOString()

        // Query available meetings
        const { data, error } = await supabase
            .from('meetings')
            .select(`
                id,
                title,
                description,
                type,
                start_time,
                end_time,
                duration,
                is_online,
                meeting_link,
                location,
                status,
                max_participants,
                available_slots,
                teacher_id(id, name, avatar_url, title),
                class_id(id, name)
            `)
            .eq('status', 'open')
            .gte('start_time', now)
            .order('start_time', { ascending: true })

        if (error) {
            console.error('Error fetching available meetings:', error)
            return []
        }

        // If user is a student, filter out meetings they're already enrolled in
        let filteredData = data
        if (user.role === 'STUDENT') {
            const { data: enrollments, error: enrollmentError } = await supabase
                .from('meeting_participants')
                .select('meeting_id')
                .eq('user_id', user.id)

            if (!enrollmentError && enrollments) {
                const enrolledMeetingIds = enrollments.map(e => e.meeting_id)
                filteredData = data.filter(meeting => !enrolledMeetingIds.includes(meeting.id))
            }
        }

        return (filteredData as unknown as any[]).map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            teacher: {
                name: meeting.teacher_id?.name || 'Unknown Teacher',
                avatar_url: meeting.teacher_id?.avatar_url || '/images/default-avatar.jpg',
                title: meeting.teacher_id?.title || 'Teacher'
            },
            type: meeting.type as MeetingType,
            date: formatDate(new Date(meeting.start_time)),
            displayDate: formatDisplayDate(new Date(meeting.start_time)),
            startTime: formatTime(meeting.start_time),
            endTime: formatTime(meeting.end_time),
            duration: calculateDuration(meeting.start_time, meeting.end_time),
            isOnline: meeting.is_online,
            status: meeting.status as MeetingStatus,
            meetingLink: meeting.meeting_link,
            location: meeting.location,
            relatedClass: meeting.class_id ? {
                id: meeting.class_id.id,
                name: meeting.class_id.name
            } : null,
            participants: meeting.participants_count || 0,
            maxParticipants: meeting.max_participants || 0
        }))
    } catch (error) {
        console.error('Error in getAvailableMeetings:', error)
        return []
    }
}

/**
 * Get all meetings for calendar view
 */
export async function getMeetingsForCalendar(): Promise<CalendarMeeting[]> {
    const user = await requireServerAuth()

    try {
        // Only get upcoming meetings since they're already properly filtered
        const upcomingMeetings = await getUpcomingMeetings()

        // Format meetings for calendar view
        return upcomingMeetings.map(meeting => {
            // Parse the date from the meeting's date field
            const meetingDate = new Date(meeting.date)

            return {
                id: meeting.id,
                title: meeting.title,
                time: meeting.startTime,
                isOnline: meeting.isOnline,
                type: meeting.type,
                day: meetingDate.getDate(),
                teacher: meeting.teacher
            }
        }).filter(meeting => meeting.day !== null)
    } catch (error) {
        console.error('Error in getMeetingsForCalendar:', error)
        return []
    }
}

// Helper function to format date and time
function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let dayStr = ''
    if (date.toDateString() === today.toDateString()) {
        dayStr = 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
        dayStr = 'Tomorrow'
    } else {
        dayStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    }

    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })

    return `${dayStr}, ${timeStr}`
}

// Helper function to calculate duration between two dates
function calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationMs = end.getTime() - start.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)

    if (durationHours === 1) {
        return '1 hour'
    } else if (durationHours % 1 === 0) {
        return `${durationHours} hours`
    } else {
        return `${durationHours.toFixed(1)} hours`
    }
} 