import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-card text-center">
                <div className="mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-accent-red-light rounded-full flex items-center justify-center">
                            <ShieldAlert className="w-8 h-8 text-accent-red" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600">
                        You don&apos;t have permission to access this page.
                    </p>
                </div>
                <div>
                    <Link
                        href="/dashboard"
                        className="btn btn-primary w-full inline-flex justify-center items-center"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
} 