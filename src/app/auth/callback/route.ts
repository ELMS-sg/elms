import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    console.log('Auth callback route called with code:', code ? 'present' : 'missing')

    if (code) {
        try {
            const cookieStore = cookies()
            const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

            // Exchange the code for a session
            const { error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Error exchanging code for session:', error)
                // Still redirect to dashboard, but the user might not be logged in
                return NextResponse.redirect(new URL('/login?error=auth_callback_failed', requestUrl.origin))
            }

            console.log('Successfully exchanged code for session')

            // Check if the session was created successfully
            const { data: { session } } = await supabase.auth.getSession()
            console.log('Session after exchange:', session ? 'Session exists' : 'No session')

        } catch (error) {
            console.error('Exception in exchangeCodeForSession:', error)
            return NextResponse.redirect(new URL('/login?error=auth_exception', requestUrl.origin))
        }
    } else {
        console.error('No code parameter found in auth callback')
        return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin))
    }

    // URL to redirect to after sign in process completes
    console.log('Redirecting to dashboard after auth callback')
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
} 