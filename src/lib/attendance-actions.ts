'use server'

import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { requireServerAuth } from './actions'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { Database } from '@/types/supabase'

// Helper function to get Supabase client - cached to avoid multiple instantiations
const getSupabase = cache(() => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

/**
 * Mark attendance for a student
 */
export async function markAttendance(classId: string, studentId: string, date: string, status: 'present' | 'absent') {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    // Only teachers can mark attendance
    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can mark attendance')
    }

    // Verify the teacher owns this class
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', classId)
        .single()

    if (classError || !classData) {
        console.error('Error verifying class ownership:', classError)
        throw new Error('Failed to verify class ownership')
    }

    if (classData.teacher_id !== user.id) {
        throw new Error('You can only mark attendance for your own classes')
    }

    // Check if attendance record already exists
    const { data: existingRecord, error: checkError } = await supabase
        .from('attendance')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', studentId)
        .eq('date', date)
        .single()

    try {
        if (existingRecord) {
            // Update existing record
            const { error: updateError } = await supabase
                .from('attendance')
                .update({ status })
                .eq('id', existingRecord.id)

            if (updateError) throw updateError
        } else {
            // Create new record
            const { error: insertError } = await supabase
                .from('attendance')
                .insert({
                    class_id: classId,
                    student_id: studentId,
                    date,
                    status,
                    marked_by: user.id
                })

            if (insertError) throw insertError
        }

        // Revalidate the class page
        revalidatePath(`/dashboard/classes/${classId}`)

        return { success: true }
    } catch (error) {
        console.error('Error marking attendance:', error)
        throw new Error('Failed to mark attendance')
    }
}

/**
 * Get attendance records for a class
 */
export async function getClassAttendance(classId: string) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    const { data, error } = await supabase
        .from('attendance')
        .select(`
            id,
            date,
            status,
            student_id,
            marked_by
        `)
        .eq('class_id', classId)
        .order('date', { ascending: true })

    if (error) {
        console.error('Error fetching attendance:', error)
        return []
    }

    return data
} 