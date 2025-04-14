import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import { getSupabase } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import AdminAssignmentsClient from "./AdminAssignmentsClient"

export const metadata: Metadata = {
    title: "Assignments Management | English Learning Center",
    description: "Manage all assignments in the system",
}

export default async function AdminAssignmentsPage() {
    const user = await requireServerAuth()

    if (user.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    const supabase = await getSupabase()

    const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
            *,
            course:classes (
                id,
                name
            ),
            teacher:users (
                id,
                name
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching assignments:', error)
        return <div>Error loading assignments</div>
    }

    return <AdminAssignmentsClient initialAssignments={assignments || []} />
} 