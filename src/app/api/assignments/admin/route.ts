import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'
import { requireServerAuth } from '@/lib/actions'

export async function GET() {
    try {
        // Authenticate user
        const user = await requireServerAuth()
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only admins can view all assignments.' },
                { status: 403 }
            )
        }

        const supabase = await getSupabase()

        // Fetch assignments with related class and teacher information
        const { data: assignments, error } = await supabase
            .from('assignments')
            .select(`
                *,
                classes:class_id (
                    name
                ),
                users:teacher_id (
                    name
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching assignments:', error)
            return NextResponse.json(
                { error: 'Failed to fetch assignments' },
                { status: 500 }
            )
        }

        // Transform the data to match the expected format
        const transformedAssignments = assignments.map(assignment => ({
            ...assignment,
            class_name: assignment.classes?.name || 'Unknown Class',
            teacher_name: assignment.users?.name || 'Unknown Teacher'
        }))

        return NextResponse.json(transformedAssignments)
    } catch (error) {
        console.error('Error in assignments admin route:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 