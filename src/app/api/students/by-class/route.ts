import { NextRequest, NextResponse } from "next/server"
import { requireServerAuth } from "@/lib/actions"
import { getClassById } from "@/lib/class-actions"

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

        // Format the students data to match the expected format
        const formattedStudents = classData.students.map(student => ({
            id: student.id,
            name: student.name,
            // Add default avatar since it's null in the original data
            avatar: '/images/default-avatar.jpg'
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