'use server'

import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { requireServerAuth } from './actions'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { Database } from '@/types/supabase'

// Helper function to get Supabase client - cached to avoid multiple instantiations
const getSupabase = cache(async () => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

/**
 * Upload a course material file
 */
export async function uploadMaterial(
    classId: string,
    file: File,
    name: string,
    description?: string
) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can upload materials')
    }

    // Verify the teacher owns this class
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('teacher_id')
        .eq('id', classId)
        .single()

    if (classError || !classData) {
        throw new Error('Failed to verify class ownership')
    }

    if (classData.teacher_id !== user.id) {
        throw new Error('You can only upload materials for your own classes')
    }

    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !['pdf', 'doc', 'docx'].includes(fileExt)) {
        throw new Error('Only PDF and Word documents are allowed')
    }

    // Create a unique file path
    const timestamp = Date.now()
    const filePath = `materials/${classId}/${timestamp}-${file.name}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase
        .storage
        .from('course-materials')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Error uploading file:', uploadError)
        throw new Error('Failed to upload file')
    }

    // Create material record in database
    const { error: dbError } = await supabase
        .from('course_materials')
        .insert({
            class_id: classId,
            name,
            description,
            file_path: filePath,
            file_type: fileExt.toUpperCase(),
            file_size: file.size,
            uploaded_by: user.id
        })

    if (dbError) {
        // If database insert fails, try to delete the uploaded file
        await supabase
            .storage
            .from('course-materials')
            .remove([filePath])

        console.error('Error creating material record:', dbError)
        throw new Error('Failed to create material record')
    }

    // Revalidate the class page
    revalidatePath(`/dashboard/classes/${classId}`)

    return { success: true }
}

/**
 * Get course materials for a class
 */
export async function getClassMaterials(classId: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    const { data: materials, error } = await supabase
        .from('course_materials')
        .select(`
            id,
            name,
            description,
            file_path,
            file_type,
            file_size,
            uploaded_at,
            uploaded_by (
                id,
                name
            )
        `)
        .eq('class_id', classId)
        .order('uploaded_at', { ascending: false })

    if (error) {
        console.error('Error fetching materials:', error)
        return []
    }

    // Get signed URLs for each file
    const materialsWithUrls = await Promise.all(
        materials.map(async (material) => {
            const { data: { publicUrl } } = supabase
                .storage
                .from('course-materials')
                .getPublicUrl(material.file_path)

            return {
                ...material,
                downloadUrl: publicUrl
            }
        })
    )

    return materialsWithUrls
}

/**
 * Delete a course material
 */