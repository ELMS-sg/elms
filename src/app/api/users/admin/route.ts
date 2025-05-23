import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';

export async function GET() {
    try {
        // Only admin can access this endpoint
        const user = await requireServerAuth();

        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized: Only admins can access this endpoint' },
                { status: 403 }
            );
        }

        // Get Supabase client
        const supabase = await getSupabase();

        // Fetch all users
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at, avatar_url')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json(
                { error: 'Failed to fetch users' },
                { status: 500 }
            );
        }

        return NextResponse.json(users);

    } catch (error) {
        console.error('Error in admin users endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 