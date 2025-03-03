import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { cache } from 'react'

/**
 * Creates a Supabase admin client that bypasses RLS
 * This should only be used for server-side operations that require admin privileges
 * 
 * Note: This requires SUPABASE_SERVICE_ROLE_KEY to be set in the environment variables
 */
export const createAdminClient = cache(() => {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase URL or service role key')
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
}) 