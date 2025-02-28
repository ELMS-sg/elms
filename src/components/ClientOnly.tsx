'use client'

import { useState, useEffect } from 'react'

interface ClientOnlyProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

/**
 * ClientOnly component to prevent hydration mismatches
 * Only renders its children on the client side after the component has mounted
 */
export default function ClientOnly({ children, fallback }: ClientOnlyProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-card text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
                        <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
} 