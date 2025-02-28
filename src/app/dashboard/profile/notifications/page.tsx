import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import NotificationPreferencesForm from "@/components/profile/NotificationPreferencesForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Notification Preferences | English Learning Center",
    description: "Manage your notification settings",
}

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
    // Get authenticated user
    const user = await requireServerAuth()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-900 flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Profile
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h1>
                <p className="text-gray-600">
                    Manage how you receive notifications
                </p>
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-card p-6">
                    <NotificationPreferencesForm userId={user.id} />
                </div>
            </div>
        </div>
    )
} 