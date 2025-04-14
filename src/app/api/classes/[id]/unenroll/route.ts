import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';
import { z } from 'zod';

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
        const supabase = await getSupabase();

        // Check if class exists
        const { data: classData, error: classError } = await supabase
            .from('classes')
            .select('id')
            .eq('id', classId)
            .single();

        if (classError || !classData) {
            console.error('Error checking class:', classError);
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        // Check if student exists
        const { data: studentData, error: studentError } = await supabase
            .from('users')
            .select('id')
            .eq('id', studentId)
            .eq('role', 'STUDENT')
            .single();

        if (studentError || !studentData) {
            console.error('Error checking student:', studentError);
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Check if enrollment exists
        const { data: enrollment, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select('id')
            .eq('class_id', classId)
            .eq('student_id', studentId)
            .single();

        if (enrollmentError || !enrollment) {
            console.error('Error checking enrollment:', enrollmentError);
            return NextResponse.json(
                { error: 'Student is not enrolled in this class' },
                { status: 404 }
            );
        }

        // Remove enrollment
        const { error: deleteError } = await supabase
            .from('class_enrollments')
            .delete()
            .eq('class_id', classId)
            .eq('student_id', studentId);

        if (deleteError) {
            console.error('Error removing enrollment:', deleteError);
            return NextResponse.json(
                { error: 'Failed to remove student from class' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Student successfully removed from class' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in unenroll endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 