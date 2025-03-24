import { Metadata } from "next"
import { notFound } from "next/navigation"
import { requireServerAuth } from "@/lib/actions"
import { getAssignment } from "@/lib/assignment-actions"
import SubmitAssignmentForm from "@/components/assignments/SubmitAssignmentForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Submit Assignment | English Learning Center",
    description: "Submit your assignment",
}

export const dynamic = 'force-dynamic'

interface SubmitAssignmentPageProps {
    params: {
        id: string
    }
}

export default async function SubmitAssignmentPage({ params }: SubmitAssignmentPageProps) {
    const user = await requireServerAuth()

    if (user.role !== 'STUDENT') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
                    <p>Only students can submit assignments.</p>
                </div>
            </div>
        )
    }

    // Get the assignment
    const assignment = await getAssignment(params.id)

    // If assignment not found
    if (!assignment) {
        notFound()
    }

    // Check if assignment already has a graded submission
    if (assignment.submission?.grade) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Assignment Already Graded</h2>
                    <p>This assignment has already been submitted and graded. You cannot submit it again.</p>
                    <Link href={`/dashboard/assignments/${params.id}`} className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                        View Assignment Details
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link href={`/dashboard/assignments/${params.id}`} className="text-gray-600 hover:text-gray-900 flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Assignment
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Submit Assignment</h1>
                <p className="text-gray-600">
                    Upload your files and submit your assignment
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
                <SubmitAssignmentForm assignment={assignment} />
            </div>
        </div>
    )
} 