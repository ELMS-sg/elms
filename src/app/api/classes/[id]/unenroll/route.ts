import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { z } from 'zod';
import { unenrollFromClass } from '@/lib/class-actions';

// Validation schema for unenroll request
const UnenrollSchema = z.object({
    studentId: z.string().uuid()
});

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only admins can unenroll students.' },
                { status: 403 }
            );
        }

        const classId = params.id;
        if (!classId) {
            return NextResponse.json(
                { error: 'Class ID is required' },
                { status: 400 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const result = UnenrollSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: result.error.format() },
                { status: 400 }
            );
        }

        const { studentId } = result.data;

        try {
            await unenrollFromClass(classId, studentId);
            return NextResponse.json(
                { message: 'Student successfully removed from class' },
                { status: 200 }
            );
        } catch (error) {
            console.error('Error unenrolling student:', error);
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Failed to remove student from class' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in unenroll endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 