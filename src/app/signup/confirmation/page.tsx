'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'

function SignUpConfirmationContent() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState<string>('')

    useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
        }
    }, [searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full bg-card rounded-xl shadow-card p-8">
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-accent-green-light rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-accent-green" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                    <p className="text-gray-600">
                        We&apos;ve sent a verification link to:
                    </p>
                    <p className="font-medium text-gray-800 mt-1 flex items-center justify-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        {email || 'your email address'}
                    </p>
                </div>

                <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
                    <p className="text-sm text-primary-800">
                        Please check your email and click on the verification link to complete your registration.
                        If you don&apos;t see the email, check your spam folder.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="btn btn-primary w-full flex items-center justify-center"
                    >
                        Go to login
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Didn&apos;t receive the email? Check your spam folder or{' '}
                            <Link href="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
                                try again
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SignUpConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-card text-center">
                    <div className="animate-pulse">
                        <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                        <div className="h-24 bg-gray-200 rounded mb-6"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        }>
            <SignUpConfirmationContent />
        </Suspense>
    )
} 