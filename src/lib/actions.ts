'use server'

import { redirect } from 'next/navigation'
import { createSampleClassData } from './class-actions'
import { createSampleAssignmentData } from './assignment-actions'
import { getSupabase, getSupabaseRouteHandler } from './supabase/client'

// Server action to get the current session
export async function getServerSession() {
    try {
        const supabase = await getSupabaseRouteHandler()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Error getting session in server action:', error)
            return null
        }

        return session
    } catch (error) {
        console.error('Exception in getServerSession:', error)
        return null
    }
}

export async function getServerUser() {
    const session = await getServerSession()

    if (!session) {
        return null
    }

    return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] || 'User',
        avatar: session.user.user_metadata?.avatar_url,
        role: session.user.user_metadata?.role || 'STUDENT'
    }
}

/**
 * Require authentication for server components
 * Redirects to login if not authenticated
 */
export async function requireServerAuth() {
    try {
        console.log("requireServerAuth: Starting function")
        const supabase = await getSupabaseRouteHandler()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Error getting session in requireServerAuth:', error)
            redirect('/login')
        }

        if (!session) {
            console.log("requireServerAuth: No session found, redirecting to login")
            redirect('/login')
        }

        console.log("requireServerAuth: Session found for user", session.user.email)

        // Get user data from database
        const dbClient = await getSupabase()
        const { data: user, error: userError } = await dbClient
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

        // If user not found in the database but authenticated, create a user record
        if (userError && userError.code === 'PGRST116') {
            console.log("User not found in database, creating user record")

            // Extract user metadata for better user creation
            const fullName = session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] || 'User';

            const role = session.user.user_metadata?.role || 'STUDENT';

            console.log("Creating user with data:", {
                id: session.user.id,
                email: session.user.email,
                name: fullName,
                role: role
            });

            // Create a new user record
            const { data: newUser, error: createError } = await dbClient
                .from('users')
                .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: fullName,
                    role: role
                })
                .select()
                .single()

            if (createError) {
                console.error('Error creating user:', createError)

                // Try to get more details about the error
                if (createError.details) {
                    console.error('Error details:', createError.details)
                }

                // Check if the user might already exist (race condition)
                const { data: existingUser, error: checkError } = await dbClient
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (!checkError && existingUser) {
                    console.log("User exists despite earlier error, returning user", existingUser.id)
                    return existingUser
                }

                redirect('/login')
            }

            console.log("requireServerAuth: Created new user", newUser.id, newUser.email)

            // Create some sample data for the new user if they're a student
            if (role === 'STUDENT') {
                try {
                    // Create sample class enrollments for the new user
                    await createSampleClassData(newUser.id, role)

                    // Create sample assignments after enrolling in classes
                    await createSampleAssignmentData(newUser.id, role)
                } catch (sampleError) {
                    console.error("Error creating sample data:", sampleError)
                    // Continue anyway, this is not critical
                }
            }

            return newUser
        }

        if (userError) {
            console.error('Error fetching user:', userError)
            redirect('/login')
        }

        console.log("requireServerAuth: Found existing user", user.id, user.email)
        return user
    } catch (error) {
        console.error('Exception in requireServerAuth:', error)
        redirect('/login')
    }
}

// Server action to sign out
export async function serverSignOut() {
    const supabase = await getSupabaseRouteHandler()
    await supabase.auth.signOut()
    redirect('/login')
} 