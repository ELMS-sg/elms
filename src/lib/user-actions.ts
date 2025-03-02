"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const profileFormSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

/**
 * Get a user's profile information including their enrollments or classes
 */
export async function getUserProfile(userId: string) {
    const supabase = createClient()

    // Get the user's basic information
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

    if (userError) {
        console.error("Error fetching user profile:", userError)
        throw new Error("Failed to fetch user profile")
    }

    // If user is a student, get their enrollments
    if (user.role === "STUDENT") {
        const { data: enrollments, error: enrollmentError } = await supabase
            .from("class_enrollments")
            .select(`
                id,
                class_id,
                classes:class_id (
                    id,
                    name
                )
            `)
            .eq("student_id", user.id)

        if (enrollmentError) {
            console.error("Error fetching student enrollments:", enrollmentError)
            user.enrollments = []
        } else {
            // Format the enrollments to have a 'class' property for easier access
            user.enrollments = enrollments.map(enrollment => ({
                id: enrollment.id,
                class_id: enrollment.class_id,
                class: enrollment.classes || { name: "Unknown Class" }
            }))
        }
    }

    // If user is a teacher, get their classes
    if (user.role === "TEACHER") {
        const { data: classes, error: classesError } = await supabase
            .from("classes")
            .select("id, name")
            .eq("teacher_id", userId)

        if (classesError) {
            console.error("Error fetching teacher classes:", classesError)
            user.classes = []
        } else {
            user.classes = classes
        }
    }

    return user
}

/**
 * Update a user's profile information
 */
export async function updateUserProfile(userId: string, data: ProfileFormValues) {
    const supabase = createClient()

    // Validate the input data
    const validatedData = profileFormSchema.parse(data)

    // Update the user profile
    const { error } = await supabase
        .from("users")
        .update({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

    if (error) {
        console.error("Error updating user profile:", error)
        throw new Error("Failed to update user profile")
    }

    // Revalidate the profile page to show updated data
    revalidatePath("/dashboard/profile")

    return { success: true }
}

/**
 * Change a user's password
 */
export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const supabase = createClient()

    // First verify the current password
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("password")
        .eq("id", userId)
        .single()

    if (userError) {
        console.error("Error fetching user:", userError)
        throw new Error("Failed to verify current password")
    }

    // In a real application, you would use a proper password hashing library
    // and compare the hashed passwords. This is just a simplified example.
    if (user.password !== currentPassword) {
        throw new Error("Current password is incorrect")
    }

    // Update the password
    const { error } = await supabase
        .from("users")
        .update({
            password: newPassword,
            updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

    if (error) {
        console.error("Error updating password:", error)
        throw new Error("Failed to update password")
    }

    return { success: true }
}

/**
 * Interface for notification preferences
 */
export interface NotificationPreferences {
    email_assignments: boolean
    email_announcements: boolean
    email_messages: boolean
    email_reminders: boolean
    push_assignments: boolean
    push_announcements: boolean
    push_messages: boolean
    push_reminders: boolean
}

/**
 * Get user notification preferences
 * @param userId - The ID of the user
 * @returns The user's notification preferences
 */
export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('user_notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching notification preferences:', error);
            throw new Error('Failed to fetch notification preferences');
        }

        if (!data) {
            // If no preferences exist, create default preferences
            const defaultPreferences: NotificationPreferences = {
                email_assignments: true,
                email_announcements: true,
                email_messages: true,
                email_reminders: true,
                push_assignments: true,
                push_announcements: true,
                push_messages: true,
                push_reminders: true,
            };

            await updateNotificationPreferences(userId, defaultPreferences);
            return defaultPreferences;
        }

        return data as NotificationPreferences;
    } catch (error) {
        console.error('Error in getUserNotificationPreferences:', error);
        throw error;
    }
}

/**
 * Update user notification preferences
 * @param userId - The ID of the user
 * @param preferences - The notification preferences to update
 * @returns Success message
 */
export async function updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
): Promise<{ message: string }> {
    try {
        const supabase = createClient()

        // Check if preferences exist for this user
        const { data: existingPrefs } = await supabase
            .from('user_notification_preferences')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        let error;

        if (existingPrefs) {
            // Update existing preferences
            const { error: updateError } = await supabase
                .from('user_notification_preferences')
                .update(preferences)
                .eq('user_id', userId);

            error = updateError;
        } else {
            // Insert new preferences
            const { error: insertError } = await supabase
                .from('user_notification_preferences')
                .insert({
                    user_id: userId,
                    ...preferences
                });

            error = insertError;
        }

        if (error) {
            console.error('Error updating notification preferences:', error);
            throw new Error('Failed to update notification preferences');
        }

        return { message: 'Notification preferences updated successfully' };
    } catch (error) {
        console.error('Error in updateNotificationPreferences:', error);
        throw error;
    }
} 