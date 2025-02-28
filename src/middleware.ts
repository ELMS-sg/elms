import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Skip middleware for specific paths
    const publicPaths = ['/login', '/signup', '/verify-email', '/auth/callback', '/'];
    const protectedPaths = ['/dashboard', '/dashboard/classes', '/dashboard/assignments', '/dashboard/meetings'];

    const path = request.nextUrl.pathname;

    // Skip middleware for public paths and protected paths (handled by the page itself)
    if (publicPaths.includes(path) || protectedPaths.includes(path)) {
        return NextResponse.next();
    }

    // For other paths, check authentication
    const res = NextResponse.next();

    // Create the supabase middleware client
    const supabase = createMiddlewareClient({
        req: request,
        res
    });

    try {
        const { data: { session } } = await supabase.auth.getSession();

        // If user is not signed in and trying to access a non-public route
        if (!session && !publicPaths.includes(path)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    } catch (error) {
        console.error('Middleware error:', error);
        // Continue in case of error
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public files)
         * - api (API routes)
         */
        '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
    ],
} 