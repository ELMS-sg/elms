'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight, RefreshCw } from 'lucide-react'
import ClientOnly from '@/components/ClientOnly'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState<string>('')
    const [isResending, setIsResending] = useState(false)
    const [resendSuccess, setResendSuccess] = useState(false)
    const [resendError, setResendError] = useState<string | null>(null)

    useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
        }
    }, [searchParams])

    const handleResendEmail = async () => {
        // This is a placeholder for the actual resend functionality
        // You would implement this with your auth provider
        setIsResending(true)
        setResendSuccess(false)
        setResendError(null)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Success
            setResendSuccess(true)
        } catch (error) {
            setResendError('Failed to resend verification email. Please try again.')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-card rounded-xl shadow-card p-8">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-primary-500" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
                    <p className="text-gray-600">
                        We've sent a verification link to:
                    </p>
                    <p className="font-medium text-gray-800 mt-1 flex items-center justify-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        {email || 'your email address'}
                    </p>
                </div>

                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-primary-800">
                        Please check your email and click on the verification link to activate your account.
                        If you don't see the email, check your spam folder.
                    </p>
                </div>

                {resendSuccess && (
                    <div className="bg-accent-green-light border border-accent-green rounded-lg p-4 mb-6">
                        <p className="text-sm text-accent-green-dark">
                            Verification email has been resent successfully!
                        </p>
                    </div>
                )}

                {resendError && (
                    <div className="bg-accent-red-light border border-accent-red rounded-lg p-4 mb-6">
                        <p className="text-sm text-accent-red-dark">
                            {resendError}
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className="btn btn-outline w-full flex items-center justify-center"
                    >
                        {isResending ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Resending...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Resend verification email
                            </>
                        )}
                    </button>

                    <Link
                        href="/login"
                        className="btn btn-primary w-full flex items-center justify-center"
                    >
                        Go to login
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Need help?{' '}
                            <Link href="/contact" className="text-primary-500 hover:text-primary-600 font-medium">
                                Contact support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <ClientOnly>
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-card text-center">
                        <div className="animate-pulse">
                            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                            <div className="h-24 bg-gray-200 rounded mb-6"></div>
                            <div className="h-10 bg-gray-200 rounded mb-4"></div>
                            <div className="h-10 bg-primary-100 rounded"></div>
                        </div>
                    </div>
                </div>
            }>
                <VerifyEmailContent />
            </Suspense>
        </ClientOnly>
    )
} 