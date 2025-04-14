import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';

export async function GET() {
    try {
        // Only admin can access this endpoint
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const supabase = await getSupabase();

        // Fetch all users with role STUDENT
        const { data: students, error } = await supabase
            .from('users')
            .select('id, name, email, avatar_url')
            .eq('role', 'STUDENT')
            .order('name');

        if (error) {
            console.error('Error fetching students:', error);
            return NextResponse.json(
                { error: 'Failed to fetch students' },
                { status: 500 }
            );
        }

        return NextResponse.json(students);
    } catch (error) {
        console.error('Error in GET students endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 