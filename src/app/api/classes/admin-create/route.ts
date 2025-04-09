import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schema for class creation
const ClassSchema = z.object({
    name: z.string().min(1, "Class name is required"),
    description: z.string().optional(),
    teacher_id: z.string().uuid("Valid teacher ID is required"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    learning_method: z.string().optional().default("Online"),
    max_students: z.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    schedule: z.string().optional(),
    meeting_url: z.string().optional(),
});

// Map of user-friendly values to database enum values (all uppercase)
const LEARNING_METHOD_MAP: Record<string, string> = {
    "Online": "ONLINE",
    "In-Person": "IN_PERSON",
    "Blended": "BLENDED"
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

        // Map the learning method to uppercase for the enum
        const dbLearningMethod = classData.learning_method
            ? LEARNING_METHOD_MAP[classData.learning_method] || "ONLINE"
            : "ONLINE";

        console.log("Mapped learning method:", dbLearningMethod);

        console.log("Attempting direct SQL insert to bypass RLS");

        // Direct SQL query approach to bypass RLS entirely

        // IMPORTANT: This environment variable must be set in your .env.local file
        // NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
        // ADMIN_SECRET_KEY=your-service-role-key (or use a direct postgres connection)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_SECRET_KEY;

        console.log("Environment variables present:", {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey
        });

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                {
                    error: 'Server configuration error: Missing Supabase credentials',
                    details: 'Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.'
                },
                { status: 500 }
            );
        }

        // Create a fresh client with explicit RLS bypass
        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
            db: {
                schema: 'public',
            },
            global: {
                headers: {
                    'X-Client-Info': 'admin-create-classes-endpoint',
                },
            },
        });

        // Skip connection testing and go straight to insert
        console.log("Using service role key, attempting to insert directly");

        // Now perform the actual insert
        console.log("Inserting new class record...");

        try {
            const { data, error } = await supabase
                .from('classes')
                .insert({
                    name: classData.name,
                    description: classData.description || '',
                    teacher_id: classData.teacher_id,
                    start_date: classData.start_date || null,
                    end_date: classData.end_date || null,
                    learning_method: dbLearningMethod,
                    max_students: classData.max_students || 30,
                    tags: classData.tags || [],
                    image: classData.image || '',
                    schedule: classData.schedule || '',
                    meeting_url: classData.meeting_url || '',
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating class:', error);

                // Log all properties of the error object for debugging
                console.error('Full error object:', JSON.stringify(error, null, 2));

                // For RLS errors, provide alternative instructions
                if (error.code === '42501') {
                    return NextResponse.json(
                        {
                            error: 'Still facing RLS issues. Please try disabling RLS completely for testing.',
                            details: 'You can temporarily disable RLS on the classes table in Supabase to test if this works.',
                            furtherSteps: 'Go to Supabase Dashboard > Table Editor > classes > Toggle "Enable Row Level Security" to OFF temporarily.'
                        },
                        { status: 500 }
                    );
                }

                return NextResponse.json(
                    {
                        error: 'Failed to create class. Database error.',
                        details: error.message,
                        code: error.code
                    },
                    { status: 500 }
                );
            }

            console.log("Class created successfully:", data?.id);
            return NextResponse.json(data, { status: 201 });
        } catch (insertError) {
            console.error('Exception during insert operation:', insertError);
            return NextResponse.json(
                {
                    error: 'Exception during database operation',
                    details: insertError.message || 'Unknown error'
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in class creation endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
} 