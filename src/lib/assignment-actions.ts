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
import { cache } from 'react'
import { Database } from '@/types/supabase'
import { createSampleClassData } from './class-actions'

const getSupabase = cache(() => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

/**
 * Create sample assignment data for a new user
 * This is used to ensure new users have data to see
 */
export async function createSampleAssignmentData(userId: string, userRole: string) {
    try {
        console.log('createSampleAssignmentData: Starting function for user', userId, userRole)
        const supabase = await getSupabase()

        // Only create sample data for students
        if (userRole !== 'STUDENT') {
            console.log('createSampleAssignmentData: User is not a student, skipping')
            return
        }

        // Get the classes the student is enrolled in
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select('class_id')
            .eq('student_id', userId)

        if (enrollmentError || !enrollments || enrollments.length === 0) {
            console.log('createSampleAssignmentData: No enrollments found for user')
            return
        }

        console.log('createSampleAssignmentData: Found', enrollments.length, 'enrollments')

        // Get the teacher IDs for these classes
        const classIds = enrollments.map(e => e.class_id)
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select('id, teacher_id')
            .in('id', classIds)

        if (classesError || !classes || classes.length === 0) {
            console.log('createSampleAssignmentData: No classes found')
            return
        }

        // Create sample assignments for each class
        for (const cls of classes) {
            // Check if the class already has assignments
            const { data: existingAssignments, error: checkError } = await supabase
                .from('assignments')
                .select('id')
                .eq('class_id', cls.id)
                .limit(1)

            if (!checkError && existingAssignments && existingAssignments.length > 0) {
                console.log('createSampleAssignmentData: Class already has assignments, skipping', cls.id)
                continue
            }

            // Create sample assignments
            const now = new Date()

            // Assignment due in 7 days
            const dueDateUpcoming = new Date()
            dueDateUpcoming.setDate(dueDateUpcoming.getDate() + 7)

            // Assignment due in 14 days
            const dueDateFuture = new Date()
            dueDateFuture.setDate(dueDateFuture.getDate() + 14)

            // Create upcoming assignment
            const { error: createError1 } = await supabase
                .from('assignments')
                .insert({
                    title: 'Reading Comprehension Exercise',
                    description: 'Complete the reading passage and answer the questions that follow.',
                    class_id: cls.id,
                    teacher_id: cls.teacher_id,
                    due_date: dueDateUpcoming.toISOString(),
                    points: 100,
                    assignment_type: 'homework'
                })

            if (createError1) {
                console.error('Error creating sample assignment 1:', createError1)
            }

            // Create future assignment
            const { error: createError2 } = await supabase
                .from('assignments')
                .insert({
                    title: 'Grammar and Vocabulary Test',
                    description: 'Test covering the grammar and vocabulary from units 1-3.',
                    class_id: cls.id,
                    teacher_id: cls.teacher_id,
                    due_date: dueDateFuture.toISOString(),
                    points: 150,
                    assignment_type: 'test'
                })

            if (createError2) {
                console.error('Error creating sample assignment 2:', createError2)
            }

            console.log('createSampleAssignmentData: Created sample assignments for class', cls.id)
        }

        console.log('createSampleAssignmentData: Completed creating sample assignments')
    } catch (error) {
        console.error('Exception in createSampleAssignmentData:', error)
    }
}

export async function getStudentAssignments() {
    try {
        console.log('getStudentAssignments: Starting function')
        const user = await requireServerAuth()
        console.log('getStudentAssignments: User authenticated', user.id, user.role)

        const supabase = await getSupabase()

        if (user.role !== 'STUDENT') {
            console.log('getStudentAssignments: User is not a student, returning empty array')
            return []
        }

        // Get the classes the student is enrolled in
        console.log('getStudentAssignments: Fetching enrollments for student', user.id)
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select('class_id')
            .eq('student_id', user.id)

        if (enrollmentError) {
            console.error('Error fetching enrollments:', enrollmentError)
            return []
        }

        console.log('getStudentAssignments: Enrollments fetched', enrollments?.length || 0)

        if (!enrollments || enrollments.length === 0) {
            console.log('getStudentAssignments: No enrollments found, attempting to create sample data')

            try {
                // Create sample class enrollments for the user
                await createSampleClassData(user.id, user.role)

                // Create sample assignments
                await createSampleAssignmentData(user.id, user.role)

                // Try fetching enrollments again
                const { data: newEnrollments, error: newEnrollmentError } = await supabase
                    .from('class_enrollments')
                    .select('class_id')
                    .eq('student_id', user.id)

                if (newEnrollmentError) {
                    console.error('Error fetching new enrollments:', newEnrollmentError)
                    return []
                }

                if (!newEnrollments || newEnrollments.length === 0) {
                    console.log('getStudentAssignments: Still no enrollments found after creating sample data')
                    return []
                }

                console.log('getStudentAssignments: New enrollments fetched', newEnrollments.length)

                // Continue with the new enrollments
                const classIds = newEnrollments.map(e => e.class_id)
                console.log('getStudentAssignments: Class IDs', classIds)

                // Get assignments for these classes - FIXED QUERY
                console.log('getStudentAssignments: Fetching assignments for classes')
                const { data: assignments, error: assignmentsError } = await supabase
                    .from('assignments')
                    .select(`
                        *,
                        classes (
                            id,
                            name
                        )
                    `)
                    .in('class_id', classIds)
                    .order('due_date', { ascending: true })

                if (assignmentsError) {
                    console.error('Error fetching assignments:', assignmentsError)
                    return []
                }

                console.log('getStudentAssignments: Assignments fetched after creating sample data', assignments?.length || 0)

                if (!assignments || assignments.length === 0) {
                    console.log('getStudentAssignments: No assignments found after creating sample data')
                    return []
                }

                // Get teacher information separately - filter out undefined teacher_ids
                const teacherIds = [...new Set(assignments.map(a => a.teacher_id).filter(id => id !== undefined && id !== null))];

                let teacherMap = {};
                if (teacherIds.length > 0) {
                    const { data: teachers, error: teachersError } = await supabase
                        .from('users')
                        .select('id, name, email')
                        .in('id', teacherIds);

                    if (teachersError) {
                        console.error('Error fetching teachers:', teachersError);
                    }

                    // Create a map of teacher data for easy lookup
                    if (teachers) {
                        teachers.forEach(teacher => {
                            teacherMap[teacher.id] = teacher;
                        });
                    }
                }

                // Format assignments with submission status
                const now = new Date()
                const formattedAssignments = assignments.map(assignment => {
                    const dueDate = new Date(assignment.due_date)
                    let status: 'pending' | 'submitted' | 'completed' | 'late' | 'overdue' = 'pending'

                    if (dueDate < now) {
                        status = 'overdue'
                    }

                    // Calculate days remaining
                    const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                    return {
                        ...assignment,
                        teacher: teacherMap[assignment.teacher_id] || { name: 'Unknown Teacher' },
                        course: assignment.classes,
                        submission: null,
                        status,
                        isLate: false,
                        assignment_type: assignment.assignment_type || 'homework', // Ensure assignment_type is always defined
                        daysRemaining: daysRemaining > 0 ? daysRemaining : 0
                    }
                })

                return formattedAssignments
            } catch (error) {
                console.error('Error creating sample data in getStudentAssignments:', error)
                return []
            }
        }

        const classIds = enrollments.map(e => e.class_id)
        console.log('getStudentAssignments: Class IDs', classIds)

        // Get assignments for these classes - FIXED QUERY
        console.log('getStudentAssignments: Fetching assignments for classes')
        const { data: assignments, error: assignmentsError } = await supabase
            .from('assignments')
            .select(`
                *,
                classes (
                    id,
                    name
                )
            `)
            .in('class_id', classIds)
            .order('due_date', { ascending: true })

        if (assignmentsError) {
            console.error('Error fetching assignments:', assignmentsError)
            return []
        }

        console.log('getStudentAssignments: Assignments fetched', assignments?.length || 0)

        if (!assignments || assignments.length === 0) {
            console.log('getStudentAssignments: No assignments found, attempting to create sample data')

            try {
                // Create sample assignments
                await createSampleAssignmentData(user.id, user.role)

                // Try fetching assignments again
                const { data: newAssignments, error: newAssignmentsError } = await supabase
                    .from('assignments')
                    .select(`
                        *,
                        classes (
                            id,
                            name
                        )
                    `)
                    .in('class_id', classIds)
                    .order('due_date', { ascending: true })

                if (newAssignmentsError) {
                    console.error('Error fetching new assignments:', newAssignmentsError)
                    return []
                }

                if (!newAssignments || newAssignments.length === 0) {
                    console.log('getStudentAssignments: Still no assignments found after creating sample data')
                    return []
                }

                console.log('getStudentAssignments: New assignments fetched', newAssignments.length)

                // Get teacher information separately - filter out undefined teacher_ids
                const teacherIds = [...new Set(newAssignments.map(a => a.teacher_id).filter(id => id !== undefined && id !== null))];

                let teacherMap = {};
                if (teacherIds.length > 0) {
                    const { data: teachers, error: teachersError } = await supabase
                        .from('users')
                        .select('id, name, email')
                        .in('id', teacherIds);

                    if (teachersError) {
                        console.error('Error fetching teachers:', teachersError);
                    }

                    // Create a map of teacher data for easy lookup
                    if (teachers) {
                        teachers.forEach(teacher => {
                            teacherMap[teacher.id] = teacher;
                        });
                    }
                }

                // Format assignments with submission status
                const now = new Date()
                const formattedAssignments = newAssignments.map(assignment => {
                    const dueDate = new Date(assignment.due_date)
                    let status: 'pending' | 'submitted' | 'completed' | 'late' | 'overdue' = 'pending'

                    if (dueDate < now) {
                        status = 'overdue'
                    }

                    // Calculate days remaining
                    const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                    return {
                        ...assignment,
                        teacher: teacherMap[assignment.teacher_id] || { name: 'Unknown Teacher' },
                        course: assignment.classes,
                        submission: null,
                        status,
                        isLate: false,
                        assignment_type: assignment.assignment_type || 'homework', // Ensure assignment_type is always defined
                        daysRemaining: daysRemaining > 0 ? daysRemaining : 0
                    }
                })

                return formattedAssignments
            } catch (error) {
                console.error('Error creating sample data in getStudentAssignments:', error)
                return []
            }
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
        }

        // Get teacher information separately - filter out undefined teacher_ids
        const teacherIds = [...new Set(assignments.map(a => a.teacher_id).filter(id => id !== undefined && id !== null))];

        let teacherMap = {};
        if (teacherIds.length > 0) {
            const { data: teachers, error: teachersError } = await supabase
                .from('users')
                .select('id, name, email')
                .in('id', teacherIds);

            if (teachersError) {
                console.error('Error fetching teachers:', teachersError);
            }

            // Create a map of teacher data for easy lookup
            if (teachers) {
                teachers.forEach(teacher => {
                    teacherMap[teacher.id] = teacher;
                });
            }
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
                teacher: teacherMap[assignment.teacher_id] || { name: 'Unknown Teacher' },
                course: assignment.classes,
                submission,
                status,
                isLate,
                assignment_type: assignment.assignment_type || 'homework', // Ensure assignment_type is always defined
                daysRemaining: daysRemaining > 0 ? daysRemaining : 0
            }
        })

        return formattedAssignments
    } catch (error) {
        console.error('Exception in getStudentAssignments:', error)
        return []
    }
}

// Get all assignments for a teacher
export async function getTeacherAssignments() {
    try {
        console.log('getTeacherAssignments: Starting function')
        const user = await requireServerAuth()
        console.log('getTeacherAssignments: User authenticated', user.id, user.role)

        const supabase = await getSupabase()

        if (user.role !== 'TEACHER') {
            console.log('getTeacherAssignments: User is not a teacher, returning empty array')
            return []
        }

        // Get classes taught by this teacher
        console.log('getTeacherAssignments: Fetching classes for teacher', user.id)
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', user.id)

        if (classesError) {
            console.error('Error fetching teacher classes:', classesError)
            return []
        }

        if (!classes || classes.length === 0) {
            console.log('getTeacherAssignments: No classes found for teacher')
            return []
        }

        const classIds = classes.map(c => c.id)
        console.log('getTeacherAssignments: Class IDs', classIds)

        // Get assignments for these classes
        console.log('getTeacherAssignments: Fetching assignments for classes')
        const { data: assignments, error: assignmentsError } = await supabase
            .from('assignments')
            .select(`
                *,
                classes (
                    id,
                    name
                )
            `)
            .in('class_id', classIds)
            .order('due_date', { ascending: true })

        if (assignmentsError) {
            console.error('Error fetching assignments:', assignmentsError)
            return []
        }

        console.log('getTeacherAssignments: Assignments fetched', assignments?.length || 0)

        return assignments.map(assignment => ({
            ...assignment,
            course: assignment.classes
        }))
    } catch (error) {
        console.error('Exception in getTeacherAssignments:', error)
        return []
    }
}

// Get assignments that need grading
export async function getAssignmentsToGrade() {
    try {
        console.log('getAssignmentsToGrade: Starting function')
        const user = await requireServerAuth()
        console.log('getAssignmentsToGrade: User authenticated', user.id, user.role)

        const supabase = await getSupabase()

        if (user.role !== 'TEACHER') {
            console.log('getAssignmentsToGrade: User is not a teacher, returning empty array')
            return []
        }

        // Get classes taught by this teacher
        console.log('getAssignmentsToGrade: Fetching classes for teacher', user.id)
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select('id')
            .eq('teacher_id', user.id)

        if (classesError) {
            console.error('Error fetching teacher classes:', classesError)
            return []
        }

        if (!classes || classes.length === 0) {
            console.log('getAssignmentsToGrade: No classes found for teacher')
            return []
        }

        const classIds = classes.map(c => c.id)
        console.log('getAssignmentsToGrade: Class IDs', classIds)

        // First get assignments for these classes
        console.log('getAssignmentsToGrade: Fetching assignments for classes')
        const { data: assignments, error: assignmentsError } = await supabase
            .from('assignments')
            .select('id, class_id')
            .in('class_id', classIds)

        if (assignmentsError) {
            console.error('Error fetching assignments:', assignmentsError)
            return []
        }

        if (!assignments || assignments.length === 0) {
            console.log('getAssignmentsToGrade: No assignments found for classes')
            return []
        }

        const assignmentIds = assignments.map(a => a.id)
        console.log('getAssignmentsToGrade: Assignment IDs', assignmentIds.length)

        // Now get submissions for these assignments
        console.log('getAssignmentsToGrade: Fetching submissions for assignments')
        const { data: submissions, error: submissionsError } = await supabase
            .from('submissions')
            .select('*')
            .in('assignment_id', assignmentIds)
            .eq('status', 'submitted')
            .order('submitted_at', { ascending: false })

        if (submissionsError) {
            console.error('Error fetching submissions:', submissionsError)
            return []
        }

        if (!submissions || submissions.length === 0) {
            console.log('getAssignmentsToGrade: No submissions found for grading')
            return []
        }

        console.log('getAssignmentsToGrade: Submissions fetched', submissions.length)

        // Get assignment details for these submissions
        const submissionAssignmentIds = [...new Set(submissions.map(s => s.assignment_id))]
        const { data: assignmentDetails, error: assignmentDetailsError } = await supabase
            .from('assignments')
            .select(`
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
            `)
            .in('id', submissionAssignmentIds)

        if (assignmentDetailsError) {
            console.error('Error fetching assignment details:', assignmentDetailsError)
            return []
        }

        // Create a map of assignment data for easy lookup
        const assignmentMap = {}
        if (assignmentDetails) {
            assignmentDetails.forEach(assignment => {
                assignmentMap[assignment.id] = assignment
            })
        }

        // Get student information separately
        const studentIds = [...new Set(submissions.map(s => s.student_id))]
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', studentIds)

        if (studentsError) {
            console.error('Error fetching students:', studentsError)
        }

        // Create a map of student data for easy lookup
        const studentMap = {}
        if (students) {
            students.forEach(student => {
                studentMap[student.id] = student
            })
        }

        // Get submission files
        const submissionIds = submissions.map(s => s.id)
        const { data: files, error: filesError } = await supabase
            .from('submission_files')
            .select('*')
            .in('submission_id', submissionIds)

        if (filesError) {
            console.error('Error fetching submission files:', filesError)
        }

        // Format the data
        return submissions.map(submission => {
            const submissionFiles = files?.filter(f => f.submission_id === submission.id) || []
            const assignment = assignmentMap[submission.assignment_id]

            return {
                id: submission.id,
                assignment: assignment ? {
                    ...assignment,
                    course: assignment.classes
                } : { title: 'Unknown Assignment' },
                student: studentMap[submission.student_id] || { name: 'Unknown Student' },
                submitted_at: submission.submitted_at,
                files: submissionFiles
            }
        })
    } catch (error) {
        console.error('Exception in getAssignmentsToGrade:', error)
        return []
    }
}

// Get a single assignment by ID
export async function getAssignment(assignmentId: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    // Get the assignment with related data
    const { data, error } = await supabase
        .from('assignments')
        .select(`
            *,
            classes (
                id,
                name
            )
        `)
        .eq('id', assignmentId)
        .single()

    if (error) {
        console.error('Error fetching assignment:', error)
        return null
    }

    // Get teacher information separately
    const { data: teacher, error: teacherError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', data.teacher_id)
        .single();

    if (teacherError) {
        console.error('Error fetching teacher:', teacherError);
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
        teacher: teacher || { name: 'Unknown Teacher' },
        course: data.classes,
        files: files || [],
        submission
    }
}

// Create a new assignment
export async function createAssignment(formData: AssignmentFormData) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

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
    const supabase = await getSupabase()

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
    const supabase = await getSupabase()

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