import { redirect } from 'next/navigation';
import { requireAuth } from "@/lib/auth-utils";
import { getUserProfile } from "@/lib/user-actions";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAuth();
    const profile = await getUserProfile(user.id);

    // Redirect to dashboard if not an admin
    if (profile.role !== 'ADMIN') {
        redirect('/dashboard');
    }

    return (
        <div className="flex-1 bg-gray-100">
            {children}
        </div>
    );
} 