'use server'

import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { requireServerAuth } from './actions'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { Database } from '@/types/supabase'
import { createAdminClient } from './supabase/admin'

// Helper function to get Supabase client
const getSupabase = cache(async () => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

// Define meeting types
export type MeetingType = 'ONE_ON_ONE' | 'GROUP'
export type MeetingStatus = 'confirmed' | 'pending' | 'cancelled'

// Define types for database responses
type TeacherData = {
    id: string;
    name: string;
    image: string;
    title: string;
};

type ClassData = {
    id: string;
    name: string;
};

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

// Global variable to store mock meetings
let mockMeetings: MockMeeting[] = [];

/**
 * Get all upcoming meetings for a user (both student and teacher)
 */
export async function getUpcomingMeetings() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    try {
        // Get current date in ISO format
        const now = new Date().toISOString()

        // Query upcoming meetings based on user role
        let query = supabase
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
                teacher_id(id, name, image, title),
                class_id(id, name)
            `)
            .gte('start_time', now)
            .order('start_time', { ascending: true })

        // Filter based on user role
        if (user.role === 'STUDENT') {
            query = query.eq('student_id', user.id)
        } else if (user.role === 'TEACHER') {
            query = query.eq('teacher_id', user.id)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching upcoming meetings:', error)
            return []
        }

        // Format the data to match the expected structure
        const dbMeetings = (data as unknown as MeetingData[]).map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            teacher: {
                name: meeting.teacher_id?.name || 'Unknown Teacher',
                image: meeting.teacher_id?.image || '/images/default-avatar.jpg',
                title: meeting.teacher_id?.title || 'Teacher'
            },
            type: meeting.type as MeetingType,
            startTime: formatDateTime(meeting.start_time),
            endTime: formatDateTime(meeting.end_time),
            duration: calculateDuration(meeting.start_time, meeting.end_time),
            isOnline: meeting.is_online,
            meetingLink: meeting.meeting_link,
            location: meeting.location,
            status: meeting.status as MeetingStatus,
            relatedClass: meeting.class_id ? {
                id: meeting.class_id.id,
                name: meeting.class_id.name
            } : null,
            participants: meeting.participants_count || 0,
            maxParticipants: meeting.max_participants || 0
        }))

        // Filter mock meetings based on user role and date
        const relevantMockMeetings = mockMeetings.filter(meeting => {
            const meetingDate = new Date(meeting.start_time);
            const isUpcoming = meetingDate > new Date();

            if (user.role === 'STUDENT') {
                return isUpcoming && meeting.student_id === user.id;
            } else if (user.role === 'TEACHER') {
                return isUpcoming && meeting.teacher_id === user.id;
            }
            return false;
        });

        // Combine database meetings with mock meetings
        return [...dbMeetings];
    } catch (error) {
        console.error('Error in getUpcomingMeetings:', error)
        return []
    }
}

/**
 * Get all past meetings for a user
 */
export async function getPastMeetings() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    try {
        // Get current date in ISO format
        const now = new Date().toISOString()

        // Query past meetings based on user role
        let query = supabase
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
                teacher_id(id, name, image, title),
                class_id(id, name)
            `)
            .lt('end_time', now)
            .order('start_time', { ascending: false })
            .limit(10) // Limit to recent past meetings

        // Filter based on user role
        if (user.role === 'STUDENT') {
            query = query.eq('student_id', user.id)
        } else if (user.role === 'TEACHER') {
            query = query.eq('teacher_id', user.id)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching past meetings:', error)
            return []
        }

        // Format the data to match the expected structure
        const dbMeetings = (data as unknown as MeetingData[]).map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            teacher: {
                name: meeting.teacher_id?.name || 'Unknown Teacher',
                image: meeting.teacher_id?.image || '/images/default-avatar.jpg',
                title: meeting.teacher_id?.title || 'Teacher'
            },
            type: meeting.type as MeetingType,
            startTime: formatDateTime(meeting.start_time),
            endTime: formatDateTime(meeting.end_time),
            duration: calculateDuration(meeting.start_time, meeting.end_time),
            isOnline: meeting.is_online,
            meetingLink: meeting.meeting_link,
            location: meeting.location,
            status: meeting.status as MeetingStatus,
            relatedClass: meeting.class_id ? {
                id: meeting.class_id.id,
                name: meeting.class_id.name
            } : null,
            participants: meeting.participants_count || 0,
            maxParticipants: meeting.max_participants || 0
        }))

        // Filter mock meetings based on user role and date
        const relevantMockMeetings = mockMeetings.filter(meeting => {
            const meetingDate = new Date(meeting.end_time);
            const isPast = meetingDate < new Date();

            if (user.role === 'STUDENT') {
                return isPast && meeting.student_id === user.id;
            } else if (user.role === 'TEACHER') {
                return isPast && meeting.teacher_id === user.id;
            }
            return false;
        });

        // Format mock meetings to match the expected structure
        const formattedMockMeetings = relevantMockMeetings.map(meeting => {
            // Get class name from mock data or use a placeholder
            const className = "Mock Class"; // In a real app, you'd look up the class name

            return {
                id: meeting.id,
                title: meeting.title,
                description: meeting.description || "",
                teacher: {
                    name: user.name || 'Your Teacher',
                    image: user.avatar || '/images/default-avatar.jpg',
                    title: 'Teacher'
                },
                type: meeting.type,
                startTime: formatDateTime(meeting.start_time),
                endTime: formatDateTime(meeting.end_time),
                duration: calculateDuration(meeting.start_time, meeting.end_time),
                isOnline: meeting.is_online,
                meetingLink: meeting.meeting_link,
                location: meeting.location,
                status: meeting.status,
                relatedClass: meeting.class_id ? {
                    id: meeting.class_id,
                    name: className
                } : null,
                participants: 0,
                maxParticipants: meeting.max_participants || 0
            };
        });

        // Combine database meetings with mock meetings
        return [...dbMeetings, ...formattedMockMeetings];
    } catch (error) {
        console.error('Error in getPastMeetings:', error)
        return []
    }
}

/**
 * Get meeting details by ID
 */
export async function getMeetingById(meetingId: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

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
                teacher_id(id, name, image, title),
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
        return {
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            teacher: {
                name: meeting.teacher_id?.name || 'Unknown Teacher',
                image: meeting.teacher_id?.image || '/images/default-avatar.jpg',
                title: meeting.teacher_id?.title || 'Teacher'
            },
            type: meeting.type as MeetingType,
            startTime: formatDateTime(meeting.start_time),
            endTime: formatDateTime(meeting.end_time),
            duration: calculateDuration(meeting.start_time, meeting.end_time),
            isOnline: meeting.is_online,
            meetingLink: meeting.meeting_link,
            location: meeting.location,
            status: meeting.status as MeetingStatus,
            relatedClass: meeting.class_id ? {
                id: meeting.class_id.id,
                name: meeting.class_id.name
            } : null,
            participants: meeting.participants_count || 0,
            maxParticipants: meeting.max_participants || 0
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
    const supabase = await getSupabase()

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
    const supabase = await getSupabase()

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
    const supabase = await getSupabase()

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
    const supabase = await getSupabase()

    try {
        const { data, error } = await supabase
            .from('users')
            .select(`
                id,
                name,
                image,
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
            image: teacher.image || '/images/default-avatar.jpg',
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
    const supabase = await getSupabase()

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
export async function getAvailableMeetings() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

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
                teacher_id(id, name, image, title),
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

        // Format the data to match the expected structure
        return (filteredData as unknown as MeetingData[]).map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            teacher: {
                name: meeting.teacher_id?.name || 'Unknown Teacher',
                image: meeting.teacher_id?.image || '/images/default-avatar.jpg',
                title: meeting.teacher_id?.title || 'Teacher'
            },
            type: meeting.type as MeetingType,
            startTime: formatDateTime(meeting.start_time),
            endTime: formatDateTime(meeting.end_time),
            duration: calculateDuration(meeting.start_time, meeting.end_time),
            isOnline: meeting.is_online,
            meetingLink: meeting.meeting_link,
            location: meeting.location,
            availableSlots: meeting.available_slots || 1,
            maxParticipants: meeting.max_participants || 1,
            relatedClass: meeting.class_id ? {
                id: meeting.class_id.id,
                name: meeting.class_id.name
            } : null
        }))
    } catch (error) {
        console.error('Error in getAvailableMeetings:', error)
        return []
    }
}

/**
 * Get all meetings for calendar view
 */
export async function getMeetingsForCalendar() {
    const user = await requireServerAuth()

    try {
        const upcomingMeetings = await getUpcomingMeetings()
        const pastMeetings = await getPastMeetings()
        const availableMeetings = await getAvailableMeetings()

        // Combine all meetings
        const allMeetings = [...upcomingMeetings, ...pastMeetings, ...availableMeetings]

        // Format meetings for calendar view
        return allMeetings.map(meeting => {
            // Extract date from startTime
            let day = null

            if (meeting.startTime.includes('Today')) {
                day = new Date().getDate()
            } else if (meeting.startTime.includes('Tomorrow')) {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                day = tomorrow.getDate()
            } else {
                const dateMatch = meeting.startTime.match(/([A-Za-z]+)\s+(\d+)/)
                if (dateMatch) {
                    day = parseInt(dateMatch[2])
                }
            }

            return {
                id: meeting.id,
                title: meeting.title,
                time: meeting.startTime.split(', ')[1] || meeting.startTime,
                isOnline: meeting.isOnline,
                type: meeting.type,
                day
            }
        }).filter(meeting => meeting.day !== null)
    } catch (error) {
        console.error('Error in getMeetingsForCalendar:', error)
        return []
    }
}

// Helper function to format date and time
function formatDateTime(isoString: string): string {
    const date = new Date(isoString)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check if the date is today or tomorrow
    if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    } else {
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    }
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