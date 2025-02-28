'use server'

import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { getServerUser, requireServerAuth } from './actions'
import {
    AssignmentFormData,
    SubmissionFormData,
    GradingFormData,
    Assignment,
    Submission,
    AssignmentWithStatus
} from '@/types/assignments'
import { revalidatePath } from 'next/cache'

const getSupabase = () => {
    const cookieStore = cookies()
    return createRouteHandlerClient({ cookies: () => cookieStore })
}

export async function getStudentAssignments() {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    if (user.role !== 'STUDENT') {
        throw new Error('Only students can access this endpoint')
    }

    const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('class_id')
        .eq('student_id', user.id)

    if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError)
        return []
    }

    if (!enrollments || enrollments.length === 0) {
        return []
    }

    const classIds = enrollments.map(e => e.class_id)

    // Get assignments for these classes
    const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
            *,
            classes (
                id,
                name
            ),
            users!assignments_teacher_id_fkey (
                id,
                name,
                email
            )
        `)
        .in('class_id', classIds)
        .order('due_date', { ascending: true })

    if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError)
        return []
    }

    // Get submissions for these assignments
    const assignmentIds = assignments.map(a => a.id)
    const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', user.id)
        .in('assignment_id', assignmentIds)

    if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError)
        return []
    }

    // Format assignments with submission status
    const now = new Date()
    const formattedAssignments = assignments.map(assignment => {
        const submission = submissions?.find(s => s.assignment_id === assignment.id)
        const dueDate = new Date(assignment.due_date)

        let status: 'pending' | 'submitted' | 'completed' | 'late' | 'overdue' = 'pending'
        let isLate = false

        if (submission) {
            if (submission.status === 'graded') {
                status = 'completed'
            } else if (submission.status === 'submitted') {
                status = 'submitted'
                // Check if it was submitted late
                const submittedDate = new Date(submission.submitted_at)
                isLate = submittedDate > dueDate
            }
        } else if (dueDate < now) {
            status = 'overdue'
        }

        // Calculate days remaining
        const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return {
            ...assignment,
            teacher: assignment.users,
            course: assignment.classes,
            submission,
            status,
            isLate,
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0
        }
    })

    return formattedAssignments
}

// Get all assignments for a teacher
export async function getTeacherAssignments() {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can access this endpoint')
    }

    // Get assignments created by this teacher
    const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
            *,
            classes (
                id,
                name
            )
        `)
        .eq('teacher_id', user.id)
        .order('due_date', { ascending: true })

    if (assignmentsError) {
        console.error('Error fetching assignments:', assignmentsError)
        return []
    }

    return assignments.map(assignment => ({
        ...assignment,
        course: assignment.classes
    }))
}

// Get assignments that need grading
export async function getAssignmentsToGrade() {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can access this endpoint')
    }

    // Get submissions for assignments created by this teacher
    const { data, error } = await supabase
        .from('submissions')
        .select(`
            *,
            assignments!inner (
                id,
                title,
                description,
                due_date,
                points,
                assignment_type,
                class_id,
                classes (
                    id,
                    name
                )
            ),
            users!submissions_student_id_fkey (
                id,
                name,
                email
            )
        `)
        .eq('assignments.teacher_id', user.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })

    if (error) {
        console.error('Error fetching submissions to grade:', error)
        return []
    }

    // Get submission files
    const submissionIds = data.map(s => s.id)
    const { data: files, error: filesError } = await supabase
        .from('submission_files')
        .select('*')
        .in('submission_id', submissionIds)

    if (filesError) {
        console.error('Error fetching submission files:', filesError)
    }

    // Format the data
    return data.map(submission => {
        const submissionFiles = files?.filter(f => f.submission_id === submission.id) || []

        return {
            id: submission.id,
            assignment: {
                ...submission.assignments,
                course: submission.assignments.classes
            },
            student: submission.users,
            submitted_at: submission.submitted_at,
            files: submissionFiles
        }
    })
}

// Get a single assignment by ID
export async function getAssignment(assignmentId: string) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    // Get the assignment with related data
    const { data, error } = await supabase
        .from('assignments')
        .select(`
            *,
            classes (
                id,
                name
            ),
            users!assignments_teacher_id_fkey (
                id,
                name,
                email
            )
        `)
        .eq('id', assignmentId)
        .single()

    if (error) {
        console.error('Error fetching assignment:', error)
        return null
    }

    // Get assignment files
    const { data: files, error: filesError } = await supabase
        .from('assignment_files')
        .select('*')
        .eq('assignment_id', assignmentId)

    if (filesError) {
        console.error('Error fetching assignment files:', filesError)
    }

    // If user is a student, get their submission
    let submission = null
    if (user.role === 'STUDENT') {
        const { data: submissionData, error: submissionError } = await supabase
            .from('submissions')
            .select('*')
            .eq('assignment_id', assignmentId)
            .eq('student_id', user.id)
            .single()

        if (submissionError && submissionError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching submission:', submissionError)
        }

        if (submissionData) {
            // Get submission files
            const { data: submissionFiles, error: submissionFilesError } = await supabase
                .from('submission_files')
                .select('*')
                .eq('submission_id', submissionData.id)

            if (submissionFilesError) {
                console.error('Error fetching submission files:', submissionFilesError)
            }

            submission = {
                ...submissionData,
                files: submissionFiles || []
            }
        }
    }

    return {
        ...data,
        teacher: data.users,
        course: data.classes,
        files: files || [],
        submission
    }
}

// Create a new assignment
export async function createAssignment(formData: AssignmentFormData) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can create assignments')
    }

    // Insert the assignment
    const { data, error } = await supabase
        .from('assignments')
        .insert({
            title: formData.title,
            description: formData.description,
            class_id: formData.class_id,
            teacher_id: user.id,
            due_date: formData.due_date,
            points: formData.points,
            assignment_type: formData.assignment_type
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating assignment:', error)
        throw new Error('Failed to create assignment')
    }

    // Handle file uploads if any
    if (formData.files && formData.files.length > 0) {
        for (const file of formData.files) {
            // Upload file to storage
            const fileName = `${Date.now()}-${file.name}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('assignment-files')
                .upload(`${data.id}/${fileName}`, file)

            if (uploadError) {
                console.error('Error uploading file:', uploadError)
                continue
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('assignment-files')
                .getPublicUrl(`${data.id}/${fileName}`)

            // Save file reference in database
            await supabase
                .from('assignment_files')
                .insert({
                    assignment_id: data.id,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    file_url: publicUrlData.publicUrl
                })
        }
    }

    revalidatePath('/dashboard/assignments')
    return data
}

// Submit an assignment
export async function submitAssignment(formData: SubmissionFormData) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    if (user.role !== 'STUDENT') {
        throw new Error('Only students can submit assignments')
    }

    // Check if a submission already exists
    const { data: existingSubmission, error: checkError } = await supabase
        .from('submissions')
        .select('id')
        .eq('assignment_id', formData.assignment_id)
        .eq('student_id', user.id)
        .single()

    let submissionId: string

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking existing submission:', checkError)
        throw new Error('Failed to submit assignment')
    }

    if (existingSubmission) {
        // Update existing submission
        const { data, error } = await supabase
            .from('submissions')
            .update({
                submitted_at: new Date().toISOString(),
                status: 'submitted'
            })
            .eq('id', existingSubmission.id)
            .select()
            .single()

        if (error) {
            console.error('Error updating submission:', error)
            throw new Error('Failed to submit assignment')
        }

        submissionId = existingSubmission.id
    } else {
        // Create new submission
        const { data, error } = await supabase
            .from('submissions')
            .insert({
                assignment_id: formData.assignment_id,
                student_id: user.id,
                submitted_at: new Date().toISOString(),
                status: 'submitted'
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating submission:', error)
            throw new Error('Failed to submit assignment')
        }

        submissionId = data.id
    }

    // Handle file uploads if any
    if (formData.files && formData.files.length > 0) {
        for (const file of formData.files) {
            // Upload file to storage
            const fileName = `${Date.now()}-${file.name}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('submission-files')
                .upload(`${submissionId}/${fileName}`, file)

            if (uploadError) {
                console.error('Error uploading file:', uploadError)
                continue
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('submission-files')
                .getPublicUrl(`${submissionId}/${fileName}`)

            // Save file reference in database
            await supabase
                .from('submission_files')
                .insert({
                    submission_id: submissionId,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                    file_url: publicUrlData.publicUrl
                })
        }
    }

    revalidatePath('/dashboard/assignments')
    return { success: true }
}

// Grade a submission
export async function gradeSubmission(formData: GradingFormData) {
    const user = await requireServerAuth()
    const supabase = getSupabase()

    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can grade submissions')
    }

    // Update the submission with grade and feedback
    const { data, error } = await supabase
        .from('submissions')
        .update({
            grade: formData.grade,
            feedback: formData.feedback,
            status: 'graded'
        })
        .eq('id', formData.submission_id)
        .select()
        .single()

    if (error) {
        console.error('Error grading submission:', error)
        throw new Error('Failed to grade submission')
    }

    revalidatePath('/dashboard/assignments')
    return data
} 