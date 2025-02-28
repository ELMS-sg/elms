'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ClientOnly from '@/components/ClientOnly'
import { LogIn, Mail, Lock, AlertCircle, BookOpen, FileText, Users } from 'lucide-react'

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

    // Initialize Supabase client on the client side only
    useEffect(() => {
        setSupabase(createClientComponentClient())

        // Check if we're already logged in
        const checkSession = async () => {
            try {
                const client = createClientComponentClient()
                const { data, error } = await client.auth.getSession()

                if (error) {
                    console.error('Error checking session:', error)
                    return
                }

                console.log('Login page session check:', data.session ? 'Session exists' : 'No session')

                if (data.session) {
                    // Check for redirect loop by looking at the redirect_count parameter
                    const redirectCount = parseInt(searchParams.get('redirect_count') || '0')

                    if (redirectCount >= 3) {
                        // We're in a redirect loop, show an error
                        setError('Redirect loop detected. Please try clearing your cookies and logging in again.')
                        console.error('Redirect loop detected, staying on login page')
                        return
                    }

                    // Add redirect count to URL
                    router.push(`/dashboard?redirect_count=${redirectCount + 1}`)
                }
            } catch (err) {
                console.error('Exception checking session:', err)
            }
        }

        checkSession()

        // Check for error parameters
        const errorParam = searchParams.get('error')
        if (errorParam) {
            let errorMessage = 'An error occurred during authentication.'

            if (errorParam === 'auth_callback_failed') {
                errorMessage = 'Authentication failed. Please try again.'
            } else if (errorParam === 'auth_exception') {
                errorMessage = 'An exception occurred during authentication. Please try again.'
            } else if (errorParam === 'no_code') {
                errorMessage = 'No authentication code was provided. Please try again.'
            } else if (errorParam === 'redirect_loop') {
                errorMessage = 'A redirect loop was detected. Please try clearing your cookies and logging in again.'
            }

            setError(errorMessage)
        }
    }, [router, searchParams])

    // Don't render form until supabase is initialized
    if (!supabase) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-card text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                        <div className="h-10 bg-gray-200 rounded mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded mb-6"></div>
                        <div className="h-10 bg-primary-100 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            setError(null)

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            // Redirect on success
            router.push('/dashboard')
        } catch (err: unknown) {
            console.error('Error:', err)
            setError(err instanceof Error ? err.message : 'Failed to sign in. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            })

            if (error) throw error
        } catch (err: unknown) {
            console.error('Error:', err)
            setError(err instanceof Error ? err.message : 'Failed to sign in with Google. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Left side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
                        <p className="text-gray-600">Sign in to continue to your learning dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-accent-red-light border border-accent-red rounded-lg px-4 py-3 mb-6 flex items-start" role="alert">
                            <AlertCircle className="w-5 h-5 text-accent-red mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-accent-red-dark">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10 w-full"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10 w-full"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full flex justify-center items-center"
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Sign in with Email
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                {isLoading ? 'Signing in...' : 'Sign in with Google'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don&apos;t have an account?{' '}
                            <Link href="/signup" className="font-medium text-primary-500 hover:text-primary-600 transition-colors duration-200">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right side - Illustration */}
            <div className="hidden md:block md:w-1/2 bg-primary-500 p-12">
                <div className="h-full flex flex-col items-center justify-center text-white">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">Learning Management System</h2>
                        <p className="text-primary-100 text-lg">Access your courses, assignments, and connect with teachers and classmates.</p>
                    </div>
                    <div className="w-full max-w-md">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center mr-4">
                                    <BookOpen className="w-5 h-5 text-primary-700" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Access Your Courses</h3>
                                    <p className="text-primary-100 text-sm">All your learning materials in one place</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center mr-4">
                                    <FileText className="w-5 h-5 text-primary-700" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Track Assignments</h3>
                                    <p className="text-primary-100 text-sm">Never miss a deadline again</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center mr-4">
                                    <Users className="w-5 h-5 text-primary-700" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Connect with Others</h3>
                                    <p className="text-primary-100 text-sm">Collaborate with teachers and classmates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <ClientOnly>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-card text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                            <div className="h-10 bg-gray-200 rounded mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded mb-6"></div>
                            <div className="h-10 bg-primary-100 rounded"></div>
                        </div>
                    </div>
                </div>
            }>
                <LoginContent />
            </Suspense>
        </ClientOnly>
    )
} 