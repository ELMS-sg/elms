import { NextRequest, NextResponse } from 'next/server';
import { submitAssignment } from '@/lib/assignment-actions';
import { requireServerAuth } from '@/lib/actions';

export async function POST(request: NextRequest) {
    try {
        // Authenticate user - must be a student
        const user = await requireServerAuth();
        if (user.role !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Only students can submit assignments' },
                { status: 403 }
            );
        }

        // Parse the form data
        const formData = await request.formData();

        // Extract data for submission
        const assignment_id = formData.get('assignment_id') as string;
        const content = formData.get('content') as string;
        const notes = formData.get('notes') as string;

        // Validate the assignment_id
        if (!assignment_id) {
            return NextResponse.json(
                { error: 'Assignment ID is required' },
                { status: 400 }
            );
        }

        // Call the submitAssignment function
        const result = await submitAssignment({
            assignment_id,
            content: content || undefined,
            notes: notes || undefined
        });

        // Return the successful result
        return NextResponse.json({
            success: true,
            id: result.submissionId,
            message: 'Assignment submitted successfully'
        });
    } catch (error) {
        console.error('Error in assignment submission API route:', error);

        return NextResponse.json(
            {
                error: error instanceof Error
                    ? error.message
                    : 'Failed to submit assignment'
            },
            { status: 500 }
        );
    }
} 