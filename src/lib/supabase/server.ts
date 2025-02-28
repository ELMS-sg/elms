import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

/**
 * Creates a Supabase client for server-side operations
 * This client uses cookies for authentication
 */
export function createClient() {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
} 