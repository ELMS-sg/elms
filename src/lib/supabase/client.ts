'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cache } from 'react';
import { Database } from '@/types/supabase';

// Create a Supabase client with the service role key for server-side operations
// This bypasses RLS policies and should be used carefully
export const getSupabase = cache(async () => {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
            }
        }
    );
});

export const getSupabaseRouteHandler = cache(async () => {
    const cookieStore = cookies();
    return createRouteHandlerClient<Database>({
        cookies: () => cookieStore
    });
}); 