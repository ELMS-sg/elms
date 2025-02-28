"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Bell, Mail, MessageSquare, Calendar } from "lucide-react"
import { updateNotificationPreferences, getUserNotificationPreferences } from "@/lib/user-actions"

interface NotificationPreferencesFormProps {
    userId: string
}

interface NotificationPreferences {
    email_assignments: boolean
    email_announcements: boolean
    email_messages: boolean
    email_reminders: boolean
    push_assignments: boolean
    push_announcements: boolean
    push_messages: boolean
    push_reminders: boolean
}

export default function NotificationPreferencesForm({ userId }: NotificationPreferencesFormProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email_assignments: true,
        email_announcements: true,
        email_messages: true,
        email_reminders: true,
        push_assignments: true,
        push_announcements: true,
        push_messages: true,
        push_reminders: true,
    })

    useEffect(() => {
        async function loadPreferences() {
            try {
                const prefs = await getUserNotificationPreferences(userId)
                if (prefs) {
                    setPreferences(prefs)
                }
            } catch (error) {
                console.error("Error loading notification preferences:", error)
                toast.error("Failed to load notification preferences")
            } finally {
                setIsLoading(false)
            }
        }

        loadPreferences()
    }, [userId])

    const handleToggle = (key: keyof NotificationPreferences) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        try {
            await updateNotificationPreferences(userId, preferences)
            toast.success("Notification preferences updated")
        } catch (error) {
            console.error("Error updating notification preferences:", error)
            toast.error("Failed to update notification preferences")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                {/* Email Notifications */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-gray-500" />
                        Email Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Assignment Updates</p>
                                <p className="text-sm text-gray-500">Receive emails about new assignments and grades</p>
                            </div>
                            <Switch
                                checked={preferences.email_assignments}
                                onCheckedChange={() => handleToggle('email_assignments')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Announcements</p>
                                <p className="text-sm text-gray-500">Receive emails about class announcements</p>
                            </div>
                            <Switch
                                checked={preferences.email_announcements}
                                onCheckedChange={() => handleToggle('email_announcements')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Messages</p>
                                <p className="text-sm text-gray-500">Receive emails when you get new messages</p>
                            </div>
                            <Switch
                                checked={preferences.email_messages}
                                onCheckedChange={() => handleToggle('email_messages')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Reminders</p>
                                <p className="text-sm text-gray-500">Receive email reminders about upcoming deadlines</p>
                            </div>
                            <Switch
                                checked={preferences.email_reminders}
                                onCheckedChange={() => handleToggle('email_reminders')}
                            />
                        </div>
                    </div>
                </div>

                {/* Push Notifications */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-gray-500" />
                        Push Notifications
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Assignment Updates</p>
                                <p className="text-sm text-gray-500">Receive push notifications about new assignments and grades</p>
                            </div>
                            <Switch
                                checked={preferences.push_assignments}
                                onCheckedChange={() => handleToggle('push_assignments')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Announcements</p>
                                <p className="text-sm text-gray-500">Receive push notifications about class announcements</p>
                            </div>
                            <Switch
                                checked={preferences.push_announcements}
                                onCheckedChange={() => handleToggle('push_announcements')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Messages</p>
                                <p className="text-sm text-gray-500">Receive push notifications when you get new messages</p>
                            </div>
                            <Switch
                                checked={preferences.push_messages}
                                onCheckedChange={() => handleToggle('push_messages')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-700">Reminders</p>
                                <p className="text-sm text-gray-500">Receive push reminders about upcoming deadlines</p>
                            </div>
                            <Switch
                                checked={preferences.push_reminders}
                                onCheckedChange={() => handleToggle('push_reminders')}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </div>
        </form>
    )
} 