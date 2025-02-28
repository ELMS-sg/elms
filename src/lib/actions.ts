'use server'

import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

// Server action to get the current session
export async function getServerSession() {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
        console.error('Error getting session in server action:', error)
        return null
    }

    return session
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
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    console.log("getSession result: Session found")
    console.log("getCurrentUser result:", session.user.email)

    // Get user data from database
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

    // If user not found in the database but authenticated, create a user record
    if (error && error.code === 'PGRST116') {
        console.log("User not found in database, creating user record")

        // Create a new user record
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    session.user.email?.split('@')[0] || 'User',
                password: '', // Empty password since auth is handled by Supabase Auth
                role: session.user.user_metadata?.role || 'STUDENT',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (createError) {
            console.error('Error creating user:', createError)
            redirect('/login')
        }

        return newUser
    }

    if (error) {
        console.error('Error fetching user:', error)
        redirect('/login')
    }

    return user
}

// Server action to sign out
export async function serverSignOut() {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    await supabase.auth.signOut()
    redirect('/login')
} 