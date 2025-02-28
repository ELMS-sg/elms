import { requireAuth } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/DashboardNav"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Use requireAuth which handles the redirect if not authenticated
    const user = await requireAuth()

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNav user={user} />
            <main className="pt-16">{children}</main>
        </div>
    )
} 