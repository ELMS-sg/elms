import { NextRequest, NextResponse } from 'next/server'
import { gradeSubmission } from '@/lib/assignment-actions'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json()
        const { submission_id, grade, feedback } = body

        // Basic validation
        if (!submission_id) {
            return NextResponse.json(
                { error: 'Missing submission ID' },
                { status: 400 }
            )
        }

        if (typeof grade !== 'number' || grade < 0) {
            return NextResponse.json(
                { error: 'Grade must be a positive number' },
                { status: 400 }
            )
        }

        // Use the server action to grade the submission
        const result = await gradeSubmission({
            submission_id,
            grade,
            feedback: feedback || '',
        })

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Error in grading submission API route:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to grade submission' },
            { status: 500 }
        )
    }
} 