import { NextRequest, NextResponse } from "next/server"
import { requireServerAuth } from "@/lib/actions"
import { getClassById } from "@/lib/class-actions"
import { getSupabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
    try {
        // Authenticate the user
        const user = await requireServerAuth()
        console.log(`API: User authenticated: ${user.id}, role: ${user.role}`)

        // Check if the user is a teacher (only teachers should access student lists)
        if (user.role !== 'TEACHER') {
            console.log(`API: Unauthorized access attempt by non-teacher: ${user.role}`)
            return NextResponse.json(
                { error: "Unauthorized. Only teachers can access student lists." },
                { status: 403 }
            )
        }

        // Get the class ID from the query parameters
        const { searchParams } = new URL(request.url)
        const classId = searchParams.get('classId')

        if (!classId) {
            console.log(`API: Missing classId parameter`)
            return NextResponse.json(
                { error: "Class ID is required" },
                { status: 400 }
            )
        }

        console.log(`API: Fetching class data for class: ${classId}`)

        // Get class data using the getClassById function
        const classData = await getClassById(classId)

        if (!classData) {
            console.log(`API: Class not found: ${classId}`)
            return NextResponse.json(
                { error: "Class not found", details: `No class with ID ${classId}` },
                { status: 404 }
            )
        }

        console.log(`API: Found class: ${classData.name} (${classId})`)
        console.log(`API: Found ${classData.students.length} students in class ${classId}`)

        // Get additional student details including avatar_url
        const supabase = await getSupabase()
        const studentIds = classData.students.map(student => student.id)

        let enhancedStudents = [...classData.students]

        if (studentIds.length > 0) {
            const { data: studentDetails } = await supabase
                .from('users')
                .select('id, avatar_url')
                .in('id', studentIds)

            if (studentDetails && studentDetails.length > 0) {
                // Create a map of student IDs to avatar URLs
                const avatarMap = studentDetails.reduce((map, student) => {
                    map[student.id] = student.avatar_url
                    return map
                }, {})

                // Enhance student objects with avatar URLs
                enhancedStudents = classData.students.map(student => ({
                    ...student,
                    avatar: avatarMap[student.id] || null
                }))
            }
        }

        // Format the students data to match the expected format
        const formattedStudents = enhancedStudents.map(student => ({
            id: student.id,
            name: student.name,
            avatar: student.avatar || '/images/default-avatar.jpg'
        }))

        console.log(`API: Returning ${formattedStudents.length} students for class ${classId}`)

        return NextResponse.json({ students: formattedStudents })
    } catch (error: any) {
        console.error("Error in students by class API:", error)
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        )
    }
} 