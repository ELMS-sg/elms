import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';
import { z } from 'zod';

// Validation schema for class creation
const ClassSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    description: z.string().optional(),
    teacher_id: z.string().uuid("Valid teacher ID is required"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    learning_method: z.string().optional().default("Hybrid"),
    max_students: z.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    schedule: z.string().optional(),
});

// Map of user-friendly values to database enum values (all uppercase)
const LEARNING_METHOD_MAP: Record<string, string> = {
    "Online": "ONLINE",
    "Offline": "IN_PERSON",
    "Hybrid": "BLENDED"
};

export async function POST(req: Request) {
    try {
        // Only admin can create classes
        const user = await requireServerAuth();
        console.log("User authenticated:", user.id, user.email, "Role:", user.role);

        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only admins can create classes' },
                { status: 403 }
            );
        }

        console.log("Admin access confirmed, proceeding with class creation");

        // Parse request body
        const body = await req.json();
        console.log("Request body:", JSON.stringify(body));

        // Validate request body
        const result = ClassSchema.safeParse(body);

        if (!result.success) {
            console.log("Validation failed:", result.error.format());
            return NextResponse.json(
                { error: 'Invalid class data', details: result.error.format() },
                { status: 400 }
            );
        }

        const classData = result.data;

        // Get Supabase client with admin privileges (service role)
        const supabase = await getSupabase();
        console.log("Supabase client created with service role");

        console.log("Attempting to create class with:", {
            name: classData.name,
            teacher_id: classData.teacher_id,
            learning_method: classData.learning_method,
            // Add for debugging
            user_id: user.id,
            user_role: user.role
        });

        // Map the learning method to uppercase for the enum
        const dbLearningMethod = classData.learning_method
            ? LEARNING_METHOD_MAP[classData.learning_method] || "ONLINE"
            : "ONLINE";

        console.log("Mapped learning method:", dbLearningMethod);

        // Try to insert a simple record to verify RLS permissions
        console.log("Attempting to insert class record...");
        const { data, error } = await supabase
            .from('classes')
            .insert({
                name: classData.name,
                description: classData.description || '',
                teacher_id: classData.teacher_id,
                start_date: classData.start_date,
                end_date: classData.end_date,
                learning_method: dbLearningMethod, // Use the uppercase value
                max_students: classData.max_students || 30,
                tags: classData.tags || [],
                image: classData.image || '',
                schedule: classData.schedule || '',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating class:', error);

            // Log more details about the error if available
            if (error.details) console.error('Error details:', error.details);
            if (error.hint) console.error('Error hint:', error.hint);

            // Check if this is an RLS error
            if (error.code === '42501') {
                console.error('This is a row-level security (RLS) policy error. Check your table policies.');

                // Try checking if we can read from the table
                console.log("Testing read access to classes table...");
                const { data: readTest, error: readError } = await supabase
                    .from('classes')
                    .select('id, name')
                    .limit(1);

                if (readError) {
                    console.error("Cannot read from classes table either:", readError);
                } else {
                    console.log("Successfully read from classes table. Count:", readTest.length);
                }
            }

            return NextResponse.json(
                {
                    error: 'Failed to create class. RLS policy issue - contact your administrator.',
                    details: error.message,
                    code: error.code
                },
                { status: 500 }
            );
        }

        console.log("Class created successfully:", data?.id);
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error('Error in class creation endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 