import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';

// Validation schema for user update
const UserUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
});

// GET a single user by ID
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Only admin can access other users' data
        const currentUser = await requireServerAuth();

        // If not admin and not accessing own data, deny access
        if (currentUser.role !== 'ADMIN' && currentUser.id !== params.id) {
            return NextResponse.json(
                { error: 'Unauthorized: You can only access your own data' },
                { status: 403 }
            );
        }

        const supabase = await getSupabase();

        // Fetch user data
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, created_at, avatar_url')
            .eq('id', params.id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            console.error('Error fetching user:', error);
            return NextResponse.json(
                { error: 'Failed to fetch user' },
                { status: 500 }
            );
        }

        return NextResponse.json(user);

    } catch (error) {
        console.error('Error in get user endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// UPDATE a user
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Only admin can update other users
        const currentUser = await requireServerAuth();

        // If not admin and not updating own data, deny access
        if (currentUser.role !== 'ADMIN' && currentUser.id !== params.id) {
            return NextResponse.json(
                { error: 'Unauthorized: You can only update your own data' },
                { status: 403 }
            );
        }

        // Check if user exists
        const supabase = await getSupabase();
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('id', params.id)
            .single();

        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            console.error('Error checking user:', checkError);
            return NextResponse.json(
                { error: 'Failed to check if user exists' },
                { status: 500 }
            );
        }

        // Parse and validate request body
        const body = await req.json();
        const result = UserUpdateSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid update data', details: result.error.format() },
                { status: 400 }
            );
        }

        const updateData = result.data;

        // Only allow role changes if current user is admin
        if (updateData.role && currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized: Only admins can change roles' },
                { status: 403 }
            );
        }

        // Check if email is being changed and if it's already in use
        if (updateData.email && updateData.email !== existingUser.email) {
            const { data: emailExists, error: emailCheckError } = await supabase
                .from('users')
                .select('id')
                .eq('email', updateData.email)
                .not('id', 'eq', params.id)
                .maybeSingle();

            if (emailCheckError) {
                console.error('Error checking email:', emailCheckError);
                return NextResponse.json(
                    { error: 'Failed to check if email is available' },
                    { status: 500 }
                );
            }

            if (emailExists) {
                return NextResponse.json(
                    { error: 'This email is already in use by another user' },
                    { status: 409 }
                );
            }
        }

        // Prepare update data
        const dataToUpdate: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (updateData.name) dataToUpdate.name = updateData.name;
        if (updateData.email) dataToUpdate.email = updateData.email.toLowerCase();
        if (updateData.role) dataToUpdate.role = updateData.role;

        // Hash password if provided
        if (updateData.password) {
            dataToUpdate.password = await bcrypt.hash(updateData.password, 10);
        }

        // Update user
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(dataToUpdate)
            .eq('id', params.id)
            .select('id, name, email, role, created_at, updated_at, avatar_url')
            .single();

        if (updateError) {
            console.error('Error updating user:', updateError);
            return NextResponse.json(
                { error: 'Failed to update user' },
                { status: 500 }
            );
        }

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Error in update user endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE a user
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Only admin can delete users
        const currentUser = await requireServerAuth();

        if (currentUser.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized: Only admins can delete users' },
                { status: 403 }
            );
        }

        // Don't allow deleting your own account
        if (currentUser.id === params.id) {
            return NextResponse.json(
                { error: 'You cannot delete your own account' },
                { status: 400 }
            );
        }

        const supabase = await getSupabase();

        // Check if user exists
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', params.id)
            .maybeSingle();

        if (checkError) {
            console.error('Error checking user:', checkError);
            return NextResponse.json(
                { error: 'Failed to check if user exists' },
                { status: 500 }
            );
        }

        if (!existingUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete user
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', params.id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete user' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in delete user endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 