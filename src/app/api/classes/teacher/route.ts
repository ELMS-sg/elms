import { NextRequest, NextResponse } from "next/server"
import { requireServerAuth } from "@/lib/actions"
import { getTeacherClasses } from "@/lib/class-actions"

export async function GET(request: NextRequest) {
    try {
        // Get the authenticated user
        const user = await requireServerAuth()

        // Only teachers can access this endpoint
        if (user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: "Unauthorized. Only teachers can access this endpoint." },
                { status: 403 }
            )
        }

        // Get classes for the teacher
        const classes = await getTeacherClasses()

        return NextResponse.json(classes)
    } catch (error) {
        console.error("Error fetching teacher classes:", error)
        return NextResponse.json(
            { error: "Failed to retrieve classes" },
            { status: 500 }
        )
    }
} 