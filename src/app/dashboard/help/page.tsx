import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, GraduationCap, UserCog } from "lucide-react"

export const metadata: Metadata = {
    title: "Help & Documentation | LMS",
    description: "Help guides and documentation for the Learning Management System",
}

export default async function HelpIndexPage() {
    const user = await requireServerAuth()

    // Automatic redirect based on role
    if (user.role === "ADMIN") {
        redirect("/admin/help")
    } else if (user.role === "TEACHER") {
        redirect("/dashboard/help/teacher")
    } else if (user.role === "STUDENT") {
        redirect("/dashboard/help/student")
    }

    // If we're still here, show the generic help selector
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Documentation</h1>

            <p className="mb-8 text-lg text-gray-700">
                Select the guide that matches your role in the Learning Management System:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/help" className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                            <UserCog className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Administrator Guide</h2>
                        <p className="text-gray-600">
                            Documentation for system administrators managing the LMS platform
                        </p>
                    </div>
                </Link>

                <Link href="/dashboard/help/teacher" className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mb-4">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Teacher Guide</h2>
                        <p className="text-gray-600">
                            Documentation for teachers managing classes, assignments, and meetings
                        </p>
                    </div>
                </Link>

                <Link href="/dashboard/help/student" className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="p-3 rounded-full bg-amber-100 text-amber-600 mb-4">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Student Guide</h2>
                        <p className="text-gray-600">
                            Documentation for students accessing classes, completing assignments, and attending meetings
                        </p>
                    </div>
                </Link>
            </div>

            <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Common Questions</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium text-gray-800">How do I change my password?</h3>
                        <p className="text-gray-600">
                            Go to your profile page by clicking on your avatar in the top-right corner and selecting "Profile".
                            Then navigate to the "Password" tab to change your password.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-800">How do I update my notification preferences?</h3>
                        <p className="text-gray-600">
                            Go to your profile page, select the "Notifications" tab, and customize which notifications
                            you want to receive and how you want to receive them.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-800">I found a bug or have a feature suggestion. What should I do?</h3>
                        <p className="text-gray-600">
                            Please contact the system administrator with details about the issue or suggestion.
                            Include screenshots and steps to reproduce any bugs you encounter.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 