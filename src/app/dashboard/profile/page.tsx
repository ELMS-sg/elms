import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import ProfileForm from "@/components/profile/ProfileForm"
import { getUserProfile } from "@/lib/user-actions"
import { Mail, Calendar, BookOpen } from "lucide-react"

export const metadata: Metadata = {
    title: "My Profile | English Learning Center",
    description: "View and edit your profile information",
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const user = await requireServerAuth()
    const profile = await getUserProfile(user.id)

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
                <p className="text-gray-600">
                    View and manage your personal information
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                        <ProfileForm user={profile} />
                    </div>

                    {profile.role === "STUDENT" && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium">Enrolled Classes</h3>
                            {profile.enrollments && profile.enrollments.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    {profile.enrollments.map((enrollment) => (
                                        <div
                                            key={enrollment.id || enrollment.class_id}
                                            className="bg-white p-4 rounded-lg border border-gray-200"
                                        >
                                            <h4 className="font-medium">
                                                {enrollment.class && enrollment.class.name ?
                                                    enrollment.class.name :
                                                    "Class information unavailable"}
                                            </h4>
                                            {enrollment.class && enrollment.class.id && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <a
                                                        href={`/dashboard/classes/${enrollment.class.id}`}
                                                        className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-md hover:bg-primary-100 transition-colors"
                                                    >
                                                        View Class
                                                    </a>
                                                    <a
                                                        href={`/dashboard/classes/${enrollment.class.id}/assignments`}
                                                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        Assignments
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Not enrolled in any classes yet.
                                </p>
                            )}
                            <div className="mt-4">
                                <a
                                    href="/dashboard/classes"
                                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                    Browse available classes
                                </a>
                            </div>
                        </div>
                    )}

                    {profile.role === "TEACHER" && (
                        <div className="mt-6">
                            <h3 className="text-lg font-medium">Teaching Classes</h3>
                            {profile.classes && profile.classes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                    {profile.classes.map((cls) => (
                                        <div
                                            key={cls.id}
                                            className="bg-white p-4 rounded-lg border border-gray-200"
                                        >
                                            <h4 className="font-medium">{cls.name}</h4>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <a
                                                    href={`/dashboard/classes/${cls.id}`}
                                                    className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-md hover:bg-primary-100 transition-colors"
                                                >
                                                    View Class
                                                </a>
                                                <a
                                                    href={`/dashboard/classes/${cls.id}/assignments`}
                                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                                >
                                                    Assignments
                                                </a>
                                                <a
                                                    href={`/dashboard/classes/${cls.id}/students`}
                                                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md hover:bg-green-100 transition-colors"
                                                >
                                                    Students
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Not teaching any classes yet.
                                </p>
                            )}
                            <div className="mt-4">
                                <a
                                    href="/dashboard/classes/create"
                                    className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                                >
                                    + Create a new class
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-bold mb-4">
                                {profile.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                            <p className="text-gray-500 capitalize">{profile.role.toLowerCase()}</p>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center text-gray-600">
                                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                                <span>{profile.email}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                            </div>
                            {profile.role === 'STUDENT' && profile.enrollments && (
                                <div className="flex items-start text-gray-600">
                                    <BookOpen className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium mb-1">Enrolled Classes:</p>
                                        <ul className="list-disc list-inside pl-1 text-sm">
                                            {profile.enrollments.map((enrollment) => (
                                                <li key={enrollment.id || enrollment.class_id}>
                                                    {enrollment.class && enrollment.class.name ?
                                                        enrollment.class.name :
                                                        "Class information unavailable"}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            {profile.role === 'TEACHER' && profile.classes && (
                                <div className="flex items-start text-gray-600">
                                    <BookOpen className="w-5 h-5 mr-3 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="font-medium mb-1">Teaching Classes:</p>
                                        <ul className="list-disc list-inside pl-1 text-sm">
                                            {profile.classes.map((cls) => (
                                                <li key={cls.id}>{cls.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                        <div className="space-y-3">
                            <a href="/dashboard/profile/password" className="block text-primary-600 hover:text-primary-700">
                                Change Password
                            </a>
                            <a href="/dashboard/profile/notifications" className="block text-primary-600 hover:text-primary-700">
                                Notification Preferences
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 