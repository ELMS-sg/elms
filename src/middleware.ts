import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Skip middleware for specific paths
    const publicPaths = ['/login', '/signup', '/verify-email', '/auth/callback', '/'];
    const protectedPaths = ['/dashboard', '/dashboard/classes', '/dashboard/assignments', '/dashboard/meetings'];

    const path = request.nextUrl.pathname;

    // Create a response object
    const res = NextResponse.next();

    // Add cache control headers to prevent caching of auth state
    res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');

    // Skip middleware for public paths
    if (publicPaths.includes(path)) {
        return res;
    }

    // Create the supabase middleware client
    const supabase = createMiddlewareClient({
        req: request,
        res
    });

    try {
        const { data: { session } } = await supabase.auth.getSession();

        // If user is not signed in and trying to access a protected route
        if (!session && !publicPaths.includes(path)) {
            // Clear any potentially stale cookies before redirecting
            const loginUrl = new URL('/login', request.url);
            const redirectRes = NextResponse.redirect(loginUrl);

            // Add cache control headers to the redirect
            redirectRes.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
            redirectRes.headers.set('Pragma', 'no-cache');
            redirectRes.headers.set('Expires', '0');

            return redirectRes;
        }
    } catch (error) {
        console.error('Middleware error:', error);
        // Redirect to login on error to prevent access to protected routes
        if (!publicPaths.includes(path)) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
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