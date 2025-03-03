import { NextRequest, NextResponse } from "next/server"
import { requireServerAuth } from "@/lib/actions"

export async function GET(request: NextRequest) {
    try {
        // Get the authenticated user
        const user = await requireServerAuth()

        // Return user data (excluding sensitive information)
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
        })
    } catch (error) {
        console.error("Error fetching user data:", error)
        return NextResponse.json(
            { error: "Not authenticated" },
            { status: 401 }
        )
    }
} 