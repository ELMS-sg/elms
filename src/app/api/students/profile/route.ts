import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Get the student ID from the query parameters
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('id');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        // Use Supabase client without auth requirement (no need for bcrypt)
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Fetch student data directly from the database
        const { data: student, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at, avatar_url')
            .eq('id', studentId)
            .single();

        if (error) {
            console.error('Error fetching student:', error);
            return NextResponse.json(
                { error: 'Failed to fetch student data' },
                { status: 500 }
            );
        }

        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error in student profile endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 