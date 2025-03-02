import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import { cache } from 'react'

/**
 * Creates a Supabase client for server-side operations
 * This client uses cookies for authentication
 * Using cache to avoid multiple instantiations
 */
export const createClient = cache(() => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({
        cookies: () => cookieStore,
    })
}) 