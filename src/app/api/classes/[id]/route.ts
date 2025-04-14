import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabase } from '@/lib/supabase/client';
import { requireServerAuth } from '@/lib/actions';
import { formatDate } from '@/lib/utils';

// Schema for class update validation
const ClassUpdateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    teacher_id: z.string().min(1, 'Teacher is required'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    learning_method: z.string().optional(),
    max_students: z.number().int().positive().default(30),
    tags: z.array(z.string()).optional(),
    schedule: z.string().optional(),
    image: z.string().optional(),
});

// Map of user-friendly values to database enum values (all uppercase)
const LEARNING_METHOD_MAP: Record<string, string> = {
    "Online": "ONLINE",
    "Offline": "IN_PERSON",  // Maps to IN_PERSON, not OFFLINE
    "Hybrid": "BLENDED"
};

// This function maps from UI values (title case) to database enum values
const getLearningMethodValue = (method: string | null | undefined): string => {
    if (!method) return 'BLENDED'; // Default value

    // If already in correct DB enum format, return as is
    if (method === 'ONLINE' || method === 'IN_PERSON' || method === 'BLENDED') {
        return method;
    }

    // Handle title case (how it's shown in UI)
    if (method === 'Online' || method === 'Offline' || method === 'Hybrid') {
        return LEARNING_METHOD_MAP[method];
    }

    // Handle lowercase (what might come from the form)
    const titleCase = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
    return LEARNING_METHOD_MAP[titleCase] || 'BLENDED'; // Default to BLENDED if unknown
};

// Map from database enum values to UI-friendly values
const getReverseMapping = (dbValue: string | null | undefined): string => {
    if (!dbValue) return 'Hybrid';

    switch (dbValue) {
        case 'ONLINE': return 'Online';
        case 'IN_PERSON': return 'Offline';
        case 'BLENDED': return 'Hybrid';
        default: return 'Hybrid';
    }
};

// GET - Fetch a specific class
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const id = params.id;
        if (!id) {
            return NextResponse.json(
                { error: 'Class ID is required' },
                { status: 400 }
            );
        }

        const supabase = await getSupabase();

        // Get the class with teacher information
        const { data: classData, error: classError } = await supabase
            .from('classes')
            .select(`
                *,
                users!classes_teacher_id_fkey (
                    id,
                    name
                )
            `)
            .eq('id', id)
            .single();

        if (classError) {
            console.error('Error fetching class:', classError);
            return NextResponse.json(
                { error: 'Failed to fetch class' },
                { status: 500 }
            );
        }

        if (!classData) {
            return NextResponse.json(
                { error: 'Class not found' },
                { status: 404 }
            );
        }

        // Log the raw value from the database
        console.log('Raw learning_method from database:', classData.learning_method,
            'Type:', typeof classData.learning_method);

        // Format the data for the frontend
        const formattedClass = {
            id: classData.id,
            name: classData.name,
            description: classData.description,
            teacher_id: classData.teacher_id,
            teacher_name: classData.users?.name || 'Unknown',
            start_date: classData.start_date,
            end_date: classData.end_date,
            learning_method: getReverseMapping(classData.learning_method),
            max_students: classData.max_students || 30,
            tags: classData.tags || ['English', 'Language'],
            schedule: classData.schedule || '',
            image: classData.image || '',
        };

        return NextResponse.json(formattedClass);
    } catch (error) {
        console.error('Error in GET class endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT - Update a class
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const id = params.id;
        if (!id) {
            return NextResponse.json(
                { error: 'Class ID is required' },
                { status: 400 }
            );
        }

        // Parse and validate request body
        const requestBody = await request.json();
        const validationResult = ClassUpdateSchema.safeParse(requestBody);

        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err =>
                `${err.path.join('.')}: ${err.message}`
            ).join(', ');

            return NextResponse.json(
                { error: `Validation error: ${errors}` },
                { status: 400 }
            );
        }

        const classData = validationResult.data;
        const supabase = await getSupabase();

        // Update the class in the database
        const { data, error } = await supabase
            .from('classes')
            .update({
                name: classData.name,
                description: classData.description,
                teacher_id: classData.teacher_id,
                start_date: classData.start_date,
                end_date: classData.end_date,
                learning_method: getLearningMethodValue(classData.learning_method),
                max_students: classData.max_students,
                tags: classData.tags,
                schedule: classData.schedule,
                image: classData.image,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating class:', error);
            return NextResponse.json(
                { error: 'Failed to update class' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Class updated successfully',
            data: data[0]
        });
    } catch (error) {
        console.error('Error in PUT class endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a class
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized - Only administrators can delete classes' },
                { status: 403 }
            );
        }

        const id = params.id;
        if (!id) {
            return NextResponse.json(
                { error: 'Class ID is required' },
                { status: 400 }
            );
        }

        const supabase = await getSupabase();

        // Delete class enrollments first (handle foreign key constraints)
        await supabase
            .from('class_enrollments')
            .delete()
            .eq('class_id', id);

        // Delete the class
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting class:', error);
            return NextResponse.json(
                { error: 'Failed to delete class' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Class deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE class endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 