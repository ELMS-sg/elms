import { NextRequest, NextResponse } from "next/server"
import { requireServerAuth } from "@/lib/actions"
import { scheduleMeeting } from "@/lib/meeting-actions"

export async function POST(request: NextRequest) {
    try {
        // Get the authenticated user
        const user = await requireServerAuth()

        // Only teachers can create meetings
        if (user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: "Unauthorized. Only teachers can create meetings." },
                { status: 403 }
            )
        }

        // Parse JSON data
        const data = await request.json()
        const {
            classId,
            meetingType,
            studentId,
            title,
            date,
            time,
            duration,
            meetingLink,
            meetingId,
            notes
        } = data

        // Validate required fields
        if (!classId || !meetingType || !title || !date || !time || !duration || !meetingLink) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate student ID for one-on-one meetings
        if (meetingType === 'ONE_ON_ONE' && !studentId) {
            return NextResponse.json(
                { error: "Student ID is required for one-on-one meetings" },
                { status: 400 }
            )
        }

        // Calculate start and end times
        const [hours, minutes] = time.split(':').map(Number)
        const startTime = new Date(date)
        startTime.setHours(hours, minutes, 0, 0)

        // Calculate end time based on duration
        const endTime = new Date(startTime)
        if (duration.includes('minutes')) {
            const durationMinutes = parseInt(duration)
            endTime.setMinutes(endTime.getMinutes() + durationMinutes)
        } else if (duration.includes('hour')) {
            const durationHours = parseFloat(duration)
            endTime.setHours(endTime.getHours() + Math.floor(durationHours))
            endTime.setMinutes(endTime.getMinutes() + (durationHours % 1) * 60)
        }

        try {
            let result: any;
            if (meetingType === 'ONE_ON_ONE') {
                result = await scheduleMeeting({
                    title,
                    description: notes || '',
                    type: meetingType,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    isOnline: true,
                    meetingLink,
                    relatedClassId: classId,
                    maxParticipants: meetingType === 'GROUP' ? 30 : 2,
                    teacherId: user.id,
                    studentId: studentId
                })
            } else {
                result = await scheduleMeeting({
                    title,
                    description: notes || '',
                    type: meetingType,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    isOnline: true,
                    meetingLink,
                    relatedClassId: classId,
                    maxParticipants: meetingType === 'GROUP' ? 30 : 2,
                    teacherId: user.id
                })
            }

            // Return success response
            return NextResponse.json({
                success: true,
                message: "Meeting created successfully",
                meetingId: result.id,
                redirectUrl: "/dashboard/meetings"
            })
        } catch (error: any) {
            console.error("Error in scheduleMeeting:", error)

            // Check if this is an RLS error
            if (error.message?.includes('row-level security policy') ||
                error.message?.includes('RLS')) {
                return NextResponse.json({
                    error: "Permission denied. The service role key is required to create meetings. Please contact your administrator.",
                    details: "This is a Row-Level Security (RLS) issue that requires admin privileges."
                }, { status: 403 })
            }

            throw error
        }
    } catch (error: any) {
        console.error("Error creating meeting:", error)

        // Provide a more helpful error message
        let errorMessage = "Failed to create meeting";
        if (error.message) {
            errorMessage += `: ${error.message}`;
        }

        return NextResponse.json(
            {
                error: errorMessage,
                // For development, include the stack trace
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        )
    }
} 