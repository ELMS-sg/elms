import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/client'
import { requireServerAuth } from '@/lib/actions'
import { z } from 'zod'

// Validation schema for assignment updates
const AssignmentUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    class_id: z.string().uuid('Invalid class ID'),
    teacher_id: z.string().uuid('Invalid teacher ID'),
    due_date: z.string().min(1, 'Due date is required'),
    points: z.number().min(0, 'Points must be a positive number'),
    assignment_type: z.enum(['essay', 'exercise', 'quiz', 'recording', 'other']),
})

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireServerAuth()
        const supabase = await getSupabase()

        const { data: assignment, error } = await supabase
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
            .eq('id', params.id)
            .single()

        if (error) {
            console.error('Error fetching assignment:', error)
            return NextResponse.json(
                { error: 'Failed to fetch assignment' },
                { status: 500 }
            )
        }

        if (!assignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            ...assignment,
            class_name: assignment.classes?.name || 'Unknown Class',
            teacher_name: assignment.users?.name || 'Unknown Teacher'
        })
    } catch (error) {
        console.error('Error in assignment route:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireServerAuth()
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only admins can edit assignments.' },
                { status: 403 }
            )
        }

        const supabase = await getSupabase()
        const body = await request.json()

        // Validate the request body
        const validatedData = AssignmentUpdateSchema.parse(body)

        // Check if assignment exists
        const { data: existingAssignment, error: checkError } = await supabase
            .from('assignments')
            .select('id')
            .eq('id', params.id)
            .single()

        if (checkError || !existingAssignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            )
        }

        // Update the assignment
        const { error: updateError } = await supabase
            .from('assignments')
            .update({
                ...validatedData,
                updated_at: new Date().toISOString()
            })
            .eq('id', params.id)

        if (updateError) {
            console.error('Error updating assignment:', updateError)
            return NextResponse.json(
                { error: 'Failed to update assignment' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Assignment updated successfully' })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            )
        }

        console.error('Error in assignment update route:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireServerAuth()
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only admins can delete assignments.' },
                { status: 403 }
            )
        }

        const supabase = await getSupabase()

        // Check if assignment exists
        const { data: existingAssignment, error: checkError } = await supabase
            .from('assignments')
            .select('id')
            .eq('id', params.id)
            .single()

        if (checkError || !existingAssignment) {
            return NextResponse.json(
                { error: 'Assignment not found' },
                { status: 404 }
            )
        }

        // Delete the assignment
        const { error: deleteError } = await supabase
            .from('assignments')
            .delete()
            .eq('id', params.id)

        if (deleteError) {
            console.error('Error deleting assignment:', deleteError)
            return NextResponse.json(
                { error: 'Failed to delete assignment' },
                { status: 500 }
            )
        }

        return NextResponse.json({ message: 'Assignment deleted successfully' })
    } catch (error) {
        console.error('Error in assignment delete route:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 