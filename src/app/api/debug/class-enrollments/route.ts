import { NextRequest, NextResponse } from "next/server"
import { requireServerAuth } from "@/lib/actions"
import { getSupabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
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

        // Get the class ID from the query parameters
        const { searchParams } = new URL(request.url)
        const classId = searchParams.get('classId')

        // Get Supabase client
        const supabase = await getSupabase()

        // Get all classes if no classId is provided
        if (!classId) {
            const { data: classes, error: classesError } = await supabase
                .from('classes')
                .select('id, name')
                .order('name')

            if (classesError) {
                console.error("Error fetching classes:", classesError)
                return NextResponse.json(
                    { error: "Failed to fetch classes", details: classesError.message },
                    { status: 500 }
                )
            }

            // For each class, get the enrollments
            const classesWithEnrollments = await Promise.all(
                classes.map(async (classItem) => {
                    const { data: enrollments, error: enrollmentsError } = await supabase
                        .from('class_enrollments')
                        .select('id, student_id, created_at')
                        .eq('class_id', classItem.id)

                    if (enrollmentsError) {
                        console.error(`Error fetching enrollments for class ${classItem.id}:`, enrollmentsError)
                        return {
                            ...classItem,
                            enrollments: [],
                            error: enrollmentsError.message
                        }
                    }

                    return {
                        ...classItem,
                        enrollments: enrollments || [],
                        studentCount: enrollments?.length || 0
                    }
                })
            )

            return NextResponse.json({ classes: classesWithEnrollments })
        }

        // If classId is provided, get enrollments for that class
        const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('id, name')
            .eq('id', classId)
            .single()

        if (classError) {
            console.error("Error fetching class:", classError)
            return NextResponse.json(
                { error: "Failed to fetch class", details: classError.message },
                { status: 500 }
            )
        }

        if (!classData) {
            return NextResponse.json(
                { error: "Class not found" },
                { status: 404 }
            )
        }

        // Get enrollments for the class
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('class_enrollments')
            .select('id, student_id, created_at')
            .eq('class_id', classId)

        if (enrollmentsError) {
            console.error("Error fetching enrollments:", enrollmentsError)
            return NextResponse.json(
                { error: "Failed to fetch enrollments", details: enrollmentsError.message },
                { status: 500 }
            )
        }

        // Get student details for each enrollment
        const studentIds = enrollments.map(enrollment => enrollment.student_id)

        let students = []
        if (studentIds.length > 0) {
            const { data: studentsData, error: studentsError } = await supabase
                .from('users')
                .select('id, name, email, role')
                .in('id', studentIds)

            if (studentsError) {
                console.error("Error fetching students:", studentsError)
                return NextResponse.json(
                    { error: "Failed to fetch students", details: studentsError.message },
                    { status: 500 }
                )
            }

            students = studentsData
        }

        return NextResponse.json({
            class: classData,
            enrollments,
            students,
            studentCount: enrollments.length
        })
    } catch (error: any) {
        console.error("Error in debug API:", error)
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        )
    }
} 