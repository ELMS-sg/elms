import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';

// Validation schema for user creation
const UserCreateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
});

export async function POST(req: Request) {
    try {
        // Only admin can create users
        const user = await requireServerAuth();

        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized: Only admins can create users' },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await req.json();

        // Validate request body
        const result = UserCreateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid user data', details: result.error.format() },
                { status: 400 }
            );
        }

        const userData = result.data;

        // Get Supabase client
        const supabase = await getSupabase();

        // Check if email already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .maybeSingle();

        if (checkError) {
            console.error('Error checking existing user:', checkError);
            return NextResponse.json(
                { error: 'Failed to check if user exists' },
                { status: 500 }
            );
        }

        if (existingUser) {
            return NextResponse.json(
                { error: 'A user with this email already exists' },
                { status: 409 }
            );
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                name: userData.name,
                email: userData.email.toLowerCase(),
                password: hashedPassword,
                role: userData.role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select('id, name, email, role, created_at')
            .single();

        if (createError) {
            console.error('Error creating user:', createError);
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // Return the created user (without password)
        return NextResponse.json(newUser, { status: 201 });

    } catch (error) {
        console.error('Error in user creation endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 