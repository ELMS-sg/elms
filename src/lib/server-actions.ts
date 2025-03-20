'use server'

import { uploadMaterial } from "./material-actions"
import { markAttendance } from "./attendance-actions"
import { updateContactGroup } from "./class-actions"

export async function uploadMaterialAction(classId: string, file: File, name: string, description: string) {
    await uploadMaterial(classId, file, name, description)
}

export async function markAttendanceAction(classId: string, studentId: string, date: string, status: "present" | "absent") {
    await markAttendance(classId, studentId, date, status)
}

export async function updateContactGroupAction(classId: string, contactGroup: string) {
    await updateContactGroup(classId, contactGroup)
} 