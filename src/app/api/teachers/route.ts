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

        // Fetch all users with role TEACHER
        const { data: teachers, error } = await supabase
            .from('users')
            .select('id, name, email, avatar_url')
            .eq('role', 'TEACHER')
            .order('name');

        if (error) {
            console.error('Error fetching teachers:', error);
            return NextResponse.json(
                { error: 'Failed to fetch teachers' },
                { status: 500 }
            );
        }

        return NextResponse.json(teachers);
    } catch (error) {
        console.error('Error in GET teachers endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 