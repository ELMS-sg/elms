import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import ProfileForm from "@/components/profile/ProfileForm"
import { getUserProfile } from "@/lib/user-actions"
import { Mail, Calendar, BookOpen } from "lucide-react"

export const metadata: Metadata = {
    title: "My Profile | English Learning Center",
    description: "View and edit your profile information",
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    // Get authenticated user
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
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                        <ProfileForm user={profile} />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Info Card */}
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
                                                <li key={enrollment.id}>{enrollment.class.name}</li>
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

                    {/* Account Settings */}
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