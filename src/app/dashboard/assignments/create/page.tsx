import { Metadata } from "next"
import { redirect } from "next/navigation"
import { requireServerAuth } from "@/lib/actions"
import CreateAssignmentForm from "@/components/assignments/CreateAssignmentForm"
import { getUserProfile } from "@/lib/user-actions"
import { getTeacherClasses } from "@/lib/class-actions"

export const metadata: Metadata = {
    title: "Create Assignment | English Learning Center",
    description: "Create a new assignment for your class",
}

export default async function CreateAssignmentPage() {
    const _user = await requireServerAuth()
    const user = await getUserProfile(_user.id)

    if (user.role !== 'TEACHER') {
        redirect('/dashboard/assignments')
    }

    const classes = await getTeacherClasses()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Create New Assignment
                </h1>
                <p className="text-gray-600">
                    Create a new assignment for your students to complete
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
                <CreateAssignmentForm classes={classes} />
            </div>
        </div>
    )
} 