'use server'

import { createClient } from '@/lib/supabase/server'
import { requireServerAuth } from './actions'
import { revalidatePath } from 'next/cache'

export type Notification = {
    id: string
    user_id: string
    title: string
    message: string
    type: 'ASSIGNMENT' | 'SUBMISSION' | 'MEETING' | 'SYSTEM'
    is_read: boolean
    related_id: string | null
    created_at: string
}

/**
 * Get notifications for the current user
 */
export async function getUserNotifications() {
    const user = await requireServerAuth()

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching notifications:', error)
        throw error
    }

    return data as Notification[]
}

/**
 * Get unread notification count for the current user
 */
export async function countUnreadNotifications() {
    const user = await requireServerAuth()

    const supabase = await createClient()

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Error counting notifications:', error)
        throw error
    }

    return count || 0
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
    const user = await requireServerAuth()

    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error marking notification as read:', error)
        throw error
    }

    revalidatePath('/dashboard')
    return true
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
    const user = await requireServerAuth()

    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Error marking all notifications as read:', error)
        throw error
    }

    revalidatePath('/dashboard')
    return true
}

/**
 * Create a notification for a user
 */
export async function createNotification({
    userId,
    title,
    message,
    type,
    relatedId = null
}: {
    userId: string
    title: string
    message: string
    type: 'ASSIGNMENT' | 'SUBMISSION' | 'MEETING' | 'SYSTEM'
    relatedId?: string | null
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            related_id: relatedId,
            is_read: false
        })

    if (error) {
        console.error('Error creating notification:', error)
        throw error
    }

    return true
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers({
    userIds,
    title,
    message,
    type,
    relatedId = null
}: {
    userIds: string[]
    title: string
    message: string
    type: 'ASSIGNMENT' | 'SUBMISSION' | 'MEETING' | 'SYSTEM'
    relatedId?: string | null
}) {
    if (!userIds.length) return true

    const supabase = await createClient()

    const notifications = userIds.map(userId => ({
        user_id: userId,
        title,
        message,
        type,
        related_id: relatedId,
        is_read: false
    }))

    const { error } = await supabase
        .from('notifications')
        .insert(notifications)

    if (error) {
        console.error('Error creating notifications:', error)
        throw error
    }

    return true
} 