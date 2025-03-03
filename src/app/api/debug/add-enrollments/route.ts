import { NextRequest, NextResponse } from "next/server"
import { requireServerAuth } from "@/lib/actions"
import { getSupabase } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
    try {
        // Authenticate the user
        const user = await requireServerAuth()

        // Only allow teachers to access this endpoint
        if (user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: "Unauthorized. Only teachers can access this endpoint." },
                { status: 403 }
            )
        }

        // Get the request body
        const body = await request.json()
        const { classId } = body

        if (!classId) {
            return NextResponse.json(
                { error: "Class ID is required" },
                { status: 400 }
            )
        }

        // Get Supabase client
        const supabase = await getSupabase()

        // Check if the class exists
        const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('id, name')
            .eq('id', classId)
            .single()

        if (classError) {
            console.error("Error checking class existence:", classError)
            return NextResponse.json(
                { error: "Failed to verify class", details: classError.message },
                { status: 500 }
            )
        }

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        // Get all students
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('role', 'STUDENT')
            .limit(5)

        if (studentsError) {
            console.error("Error fetching students:", studentsError)
            return NextResponse.json(
                { error: "Failed to fetch students", details: studentsError.message },
                { status: 500 }
            )
        }

        if (!students || students.length === 0) {
            return NextResponse.json(
                { error: "No students found to enroll" },
                { status: 404 }
            )
        }

        // Check existing enrollments
        const { data: existingEnrollments, error: enrollmentsError } = await supabase
            .from('class_enrollments')
            .select('student_id')
            .eq('class_id', classId)

        if (enrollmentsError) {
            console.error("Error checking existing enrollments:", enrollmentsError)
            return NextResponse.json(
                { error: "Failed to check existing enrollments", details: enrollmentsError.message },
                { status: 500 }
            )
        }

        // Filter out students who are already enrolled
        const existingStudentIds = existingEnrollments.map(e => e.student_id)
        const studentsToEnroll = students.filter(s => !existingStudentIds.includes(s.id))

        if (studentsToEnroll.length === 0) {
            return NextResponse.json(
                { message: "All available students are already enrolled in this class" },
                { status: 200 }
            )
        }

        // Create enrollments for each student
        const enrollments = studentsToEnroll.map(student => ({
            class_id: classId,
            student_id: student.id
        }))

        const { data: newEnrollments, error: createError } = await supabase
            .from('class_enrollments')
            .insert(enrollments)
            .select()

        if (createError) {
            console.error("Error creating enrollments:", createError)
            return NextResponse.json(
                { error: "Failed to create enrollments", details: createError.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: `Successfully enrolled ${studentsToEnroll.length} students in class ${classData.name}`,
            enrollments: newEnrollments,
            students: studentsToEnroll
        })
    } catch (error: any) {
        console.error("Error in add enrollments API:", error)
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        )
    }
} 