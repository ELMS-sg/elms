'use server'

import { deleteMaterial, uploadMaterial } from "./material-actions"
import { markAttendance } from "./attendance-actions"
import { updateContactGroup } from "./class-actions"
import { revalidatePath } from "next/cache"

export async function deleteMaterialAction(materialId: string) {
    try {
        console.log('Starting material deletion for ID:', materialId)
        const result = await deleteMaterial(materialId)
        console.log('Material deletion completed:', result)

        // Only revalidate if deletion was successful
        if (result.success) {
            revalidatePath('/dashboard/classes/[id]', 'page')
            return { success: true }
        } else {
            return { success: false, error: 'Failed to delete material' }
        }
    } catch (error) {
        console.error('Error in deleteMaterialAction:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete material'
        }
    }
}

export async function uploadMaterialAction(classId: string, file: File, name: string, description: string) {
    await uploadMaterial(classId, file, name, description)
}

export async function markAttendanceAction(classId: string, studentId: string, date: string, status: "present" | "absent") {
    await markAttendance(classId, studentId, date, status)
}

export async function updateContactGroupAction(classId: string, contactGroup: string) {
    await updateContactGroup(classId, contactGroup)
} 