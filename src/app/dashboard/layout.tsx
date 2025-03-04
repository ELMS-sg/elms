import { requireAuth } from "@/lib/auth-utils"
import { DashboardNav } from "@/components/dashboard/DashboardNav"
import { getUserProfile } from "@/lib/user-actions"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await requireAuth()
    const profile = await getUserProfile(user.id)

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardNav user={profile} />
            <main className="pt-16">{children}</main>
        </div>
    )
} 