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
    const supabase = await createClient()

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
    const supabase = await createClient()

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
    const supabase = await createClient()

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
        const supabase = await createClient()

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
        const supabase = await createClient()

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

/**
 * Upload a user's avatar image to Supabase Storage
 * @param userId - The ID of the user
 * @param file - The avatar image file to upload
 * @returns The URL of the uploaded avatar
 */
export async function uploadUserAvatar(userId: string, file: File) {
    try {
        const supabase = await createClient()

        // Generate a unique file name
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`

        // Upload the file to the avatars bucket
        const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(`${userId}/${fileName}`, file, {
                cacheControl: '3600',
                upsert: true
            })

        if (uploadError) {
            console.error('Error uploading to storage:', uploadError)
            throw new Error(uploadError.message)
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(`${userId}/${fileName}`)

        // Update the user's avatar_url in the database
        const { error: updateError } = await supabase
            .from('users')
            .update({
                avatar_url: publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating user:', updateError)
            throw new Error(updateError.message)
        }

        return publicUrl
    } catch (error) {
        console.error('Error uploading avatar:', error)
        throw error
    }
}

/**
 * Delete a user's previous avatar from storage
 * @param userId - The ID of the user
 * @param avatarUrl - The URL of the avatar to delete
 */
export async function deleteUserAvatar(userId: string, avatarUrl: string) {
    try {
        const supabase = await createClient()

        // Extract the file name from the URL
        const fileName = avatarUrl.split('/').pop()
        if (!fileName) return

        // Delete the file from storage
        const { error } = await supabase.storage
            .from('avatars')
            .remove([`${userId}/${fileName}`])

        if (error) {
            console.error('Error deleting from storage:', error)
            throw new Error(error.message)
        }
    } catch (error) {
        console.error('Error deleting avatar:', error)
        // Don't throw here as this is a cleanup operation
    }
} 