import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from "next/navigation"
import { cache } from 'react'
import { Database } from '@/types/supabase'

// Create a server client that uses cookies for session management
// Using cache to avoid multiple instantiations of the Supabase client
export const getSupabaseServerClient = cache(() => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

export async function getSession() {
    try {
        const supabase = getSupabaseServerClient()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
            console.error('Error getting session:', error)
            return null
        }

        console.log('getSession result:', session ? 'Session found' : 'No session')
        return session
    } catch (error) {
        console.error('Exception in getSession:', error)
        return null
    }
}

export async function getCurrentUser() {
    try {
        const session = await getSession()

        // If no session, return null without redirecting
        if (!session) {
            console.log('No session found in getCurrentUser')
            return null
        }

        // Get user data from session
        const userData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] || 'User',
            avatar: session.user.user_metadata?.avatar_url,
            role: session.user.user_metadata?.role || 'STUDENT'
        }

        console.log('getCurrentUser result:', userData.email)
        return userData
    } catch (error) {
        console.error('Error getting current user:', error)
        // Return null instead of redirecting on error
        return null
    }
}

// This function should be used when you want to redirect if not authenticated
export async function requireAuth() {
    const user = await getCurrentUser()
    if (!user) {
        console.log('No user found in requireAuth, redirecting to login')
        redirect("/login")
    }
    return user
}

// For client-side operations, use the createClient function
import { createClient } from '@supabase/supabase-js'

const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    })

    if (error) throw error
    return data
}

export async function signUpWithEmail(email: string, password: string, name: string) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role: 'STUDENT'
            }
        }
    })

    if (error) throw error
    return data
}

export async function signInWithGoogle() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) throw error
    return data
}

export async function signOut() {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
} 