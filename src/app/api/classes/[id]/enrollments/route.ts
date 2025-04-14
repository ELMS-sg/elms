import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';
import { enrollInClass, unenrollFromClass, getEnrolledStudents } from '@/lib/class-actions';
import { z } from 'zod';

// Schema for enrollment operations
const EnrollmentSchema = z.object({
    studentId: z.string().uuid()
});

// GET - fetch all students enrolled in a class
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized. Only admin and teachers can access this endpoint.' },
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

        // If teacher, verify they teach this class
        if (user.role === 'TEACHER') {
            const supabase = await getSupabase();
            const { data: classData, error: classError } = await supabase
                .from('classes')
                .select('id')
                .eq('id', classId)
                .eq('teacher_id', user.id)
                .single();

            if (classError || !classData) {
                return NextResponse.json(
                    { error: 'Unauthorized. You can only view enrollments for classes you teach.' },
                    { status: 403 }
                );
            }
        }

        // Get all enrolled students
        const enrolledStudents = await getEnrolledStudents(classId);
        return NextResponse.json(enrolledStudents);

    } catch (error) {
        console.error('Error in GET enrollments endpoint:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - enroll a student in a class
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Only admin can manually enroll students
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only administrators can enroll students.' },
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

        // Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const result = EnrollmentSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: result.error.format() },
                { status: 400 }
            );
        }

        // Enroll the student
        const { studentId } = result.data;

        try {
            await enrollInClass(classId, studentId);
            return NextResponse.json(
                { message: 'Student successfully enrolled in class' },
                { status: 200 }
            );
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Failed to enroll student' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error in POST enrollments endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - unenroll a student from a class
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Only admin can manually unenroll students
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only administrators can unenroll students.' },
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

        // Get student ID from URL
        const url = new URL(request.url);
        const studentId = url.searchParams.get('studentId');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        // Unenroll the student
        try {
            await unenrollFromClass(classId, studentId);
            return NextResponse.json(
                { message: 'Student successfully unenrolled from class' },
                { status: 200 }
            );
        } catch (error) {
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Failed to unenroll student' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error in DELETE enrollments endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 