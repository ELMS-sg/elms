'use server'
import { requireServerAuth } from './actions'
import {
    AssignmentFormData,
    SubmissionFormData,
    GradingFormData,
} from '@/types/assignments'
import { revalidatePath } from 'next/cache'

import { createSampleClassData } from './class-actions'
import { getStudentClasses } from './class-actions'
import { getSupabase as getSupabaseFromClient } from './supabase/client'


const getSupabase = getSupabaseFromClient

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
        const user = await requireServerAuth()
        const supabase = await getSupabase()

        if (user.role !== 'STUDENT') {
            return []
        }

        // First get the classes the student is enrolled in
        const studentClasses = await getStudentClasses()

        if (!studentClasses || studentClasses.length === 0) {
            return []
        }

        // Extract class IDs from student classes
        const classIds = studentClasses.map(cls => cls.id)

        // Get assignments for these classes
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

        if (!assignments || assignments.length === 0) {
            return []
        }

        // Get assignment IDs
        const assignmentIds = assignments.map(a => a.id)

        // Get submissions for these assignments
        const { data: submissions, error: submissionsError } = await supabase
            .from('assignment_submissions')
            .select('*')
            .eq('student_id', user.id)
            .in('assignment_id', assignmentIds)

        if (submissionsError) {
            console.error('Error fetching submissions:', submissionsError)
        }

        // Get teacher information
        const teacherIds = [...new Set(assignments.map(a => a.teacher_id).filter(id => id !== undefined && id !== null))]
        let teacherMap = {}

        if (teacherIds.length > 0) {
            const { data: teachers, error: teachersError } = await supabase
                .from('users')
                .select('id, name, email')
                .in('id', teacherIds)

            if (teachersError) {
                console.error('Error fetching teachers:', teachersError)
            } else if (teachers) {
                teachers.forEach(teacher => {
                    teacherMap[teacher.id] = teacher
                })
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
                // Check submission status to determine if it's completed (graded) or just submitted
                if (submission.status === 'GRADED' || submission.grade !== null) {
                    status = 'completed'
                } else {
                    status = 'submitted'
                }
                const submittedDate = new Date(submission.submitted_at)
                isLate = submittedDate > dueDate
            } else if (dueDate < now) {
                status = 'overdue'
            }

            const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

            return {
                ...assignment,
                teacher: teacherMap[assignment.teacher_id] || { name: 'Unknown Teacher' },
                course: assignment.classes,
                submission,
                status,
                isLate,
                assignment_type: assignment.assignment_type || 'homework',
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
            course: assignment.classes,
            assignment_type: assignment.assignment_type || 'homework' // Ensure assignment_type is always defined
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
            .from('assignment_submissions')
            .select('*')
            .in('assignment_id', assignmentIds)
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
                status: submission.status,
                grade: submission.grade,
                feedback: submission.feedback,
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
            .from('assignment_submissions')
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
    try {
        console.log('Creating new assignment, simplified version');

        // Basic validation
        if (!formData.title || !formData.class_id || !formData.due_date) {
            throw new Error('Missing required fields: title, class_id, or due_date');
        }

        // Authenticate user
        const user = await requireServerAuth();
        if (user.role !== 'TEACHER') {
            throw new Error('Only teachers can create assignments');
        }

        // Get Supabase client
        const supabase = await getSupabase();

        // Create the assignment record first
        const { data: assignment, error: assignmentError } = await supabase
            .from('assignments')
            .insert({
                title: formData.title,
                description: formData.description,
                class_id: formData.class_id,
                due_date: formData.due_date,
                points: formData.points || 100,
                assignment_type: formData.assignment_type || 'exercise',
                is_published: true,
                teacher_id: user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (assignmentError) {
            console.error('Error creating assignment:', assignmentError);
            throw new Error(`Failed to create assignment: ${assignmentError.message}`);
        }

        if (!assignment) {
            throw new Error('Failed to create assignment: No data returned');
        }

        // Don't handle file uploads in the server action
        // Instead, we'll create the assignment first, then handle files separately

        console.log('Assignment created successfully');
        revalidatePath('/dashboard/assignments');

        return {
            ...assignment,
            filesHandled: false // Indicate that files need to be handled separately
        };
    } catch (error) {
        console.error('Error in createAssignment:', error);
        throw error;
    }
}

// Submit an assignment
export async function submitAssignment(formData: SubmissionFormData) {
    try {
        // Authenticate user
        const user = await requireServerAuth();
        if (user.role !== 'STUDENT') {
            throw new Error('Only students can submit assignments');
        }

        // Get Supabase client
        const supabase = await getSupabase();

        // Check if a submission already exists
        const { data: existingSubmission, error: checkError } = await supabase
            .from('assignment_submissions')
            .select('id, status')
            .eq('assignment_id', formData.assignment_id)
            .eq('student_id', user.id)
            .single();

        let submissionId: string;

        // Safe error handling - PGRST116 means no rows found which is not an error for us
        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error('Failed to check existing submission');
        }

        const now = new Date().toISOString();

        if (existingSubmission) {
            console.log('Updating existing submission:', existingSubmission.id);

            // Update existing submission
            try {
                const { data, error } = await supabase
                    .from('assignment_submissions')
                    .update({
                        submitted_at: now,
                        updated_at: now,
                        status: 'SUBMITTED',
                        content: formData.content || null,
                        notes: formData.notes || null
                    })
                    .eq('id', existingSubmission.id)
                    .select()
                    .single();

                if (error) {
                    // If error is related to notes column, try again without it
                    if (error.message.includes("'notes' column") || error.message.includes('column "notes"')) {
                        console.warn('Notes column not found, submitting without notes');
                        const { data: dataWithoutNotes, error: errorWithoutNotes } = await supabase
                            .from('assignment_submissions')
                            .update({
                                submitted_at: now,
                                updated_at: now,
                                status: 'SUBMITTED',
                                content: formData.content || null
                            })
                            .eq('id', existingSubmission.id)
                            .select()
                            .single();

                        if (errorWithoutNotes) {
                            if (errorWithoutNotes.message.includes('row-level security policy')) {
                                console.error('RLS policy error:', errorWithoutNotes);
                                throw new Error(
                                    'Permission denied: RLS policy issue. Please run this SQL in Supabase: ' +
                                    'ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;'
                                );
                            }
                            throw new Error(`Failed to update submission: ${errorWithoutNotes.message}`);
                        }
                    } else if (error.message.includes('row-level security policy')) {
                        console.error('RLS policy error:', error);
                        throw new Error(
                            'Permission denied: RLS policy issue. Please run this SQL in Supabase: ' +
                            'ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;'
                        );
                    } else {
                        throw new Error(`Failed to update submission: ${error.message}`);
                    }
                }
            } catch (updateError) {
                // If the error was not handled above, re-throw it
                if (updateError instanceof Error) {
                    throw updateError;
                }
                throw new Error(`Failed to update submission: ${updateError}`);
            }

            submissionId = existingSubmission.id;
        } else {
            console.log('Creating new submission for student:', user.id);

            // Create new submission
            try {
                const { data, error } = await supabase
                    .from('assignment_submissions')
                    .insert({
                        assignment_id: formData.assignment_id,
                        student_id: user.id,
                        submitted_at: now,
                        created_at: now,
                        updated_at: now,
                        status: 'SUBMITTED',
                        content: formData.content || null,
                        notes: formData.notes || null
                    })
                    .select()
                    .single();

                if (error) {
                    // If error is related to notes column, try again without it
                    if (error.message.includes("'notes' column") || error.message.includes('column "notes"')) {
                        console.warn('Notes column not found, submitting without notes');
                        const { data: dataWithoutNotes, error: errorWithoutNotes } = await supabase
                            .from('assignment_submissions')
                            .insert({
                                assignment_id: formData.assignment_id,
                                student_id: user.id,
                                submitted_at: now,
                                created_at: now,
                                updated_at: now,
                                status: 'SUBMITTED',
                                content: formData.content || null
                            })
                            .select()
                            .single();

                        if (errorWithoutNotes) {
                            if (errorWithoutNotes.message.includes('row-level security policy')) {
                                console.error('RLS policy error:', errorWithoutNotes);
                                throw new Error(
                                    'Permission denied: RLS policy issue. Please run this SQL in Supabase: ' +
                                    'ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;'
                                );
                            }
                            throw new Error(`Failed to create submission: ${errorWithoutNotes.message}`);
                        }

                        if (!dataWithoutNotes) {
                            throw new Error('No data returned from submission insert');
                        }

                        submissionId = dataWithoutNotes.id;

                        // Early return since we've already set submissionId
                        revalidatePath('/dashboard/assignments');
                        return {
                            success: true,
                            submissionId
                        };
                    } else if (error.message.includes('row-level security policy')) {
                        console.error('RLS policy error:', error);
                        throw new Error(
                            'Permission denied: RLS policy issue. Please run this SQL in Supabase: ' +
                            'ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;'
                        );
                    } else {
                        throw new Error(`Failed to create submission: ${error.message}`);
                    }
                }

                if (!data) {
                    throw new Error('No data returned from submission insert');
                }

                submissionId = data.id;
            } catch (insertError) {
                // If the error was not handled above, re-throw it
                if (insertError instanceof Error) {
                    throw insertError;
                }
                throw new Error(`Failed to create submission: ${insertError}`);
            }
        }

        // We don't handle file uploads here
        // Files will be uploaded separately through the API route

        revalidatePath('/dashboard/assignments');
        return {
            success: true,
            submissionId
        };
    } catch (error) {
        console.error('Error in submitAssignment:', error);
        throw error;
    }
}

// Grade a submission
export async function gradeSubmission(formData: GradingFormData) {
    try {
        // Authenticate user
        const user = await requireServerAuth();
        if (user.role !== 'TEACHER') {
            throw new Error('Only teachers can grade submissions');
        }

        console.log('Grading submission:', {
            submissionId: formData.submission_id,
            grade: formData.grade,
            teacherId: user.id
        });

        // Basic validation
        if (!formData.submission_id) {
            throw new Error('Missing submission ID');
        }

        if (typeof formData.grade !== 'number' || formData.grade < 0) {
            throw new Error('Grade must be a positive number');
        }

        // Get Supabase client
        const supabase = await getSupabase();

        // First check if the submission exists
        const { data: submission, error: fetchError } = await supabase
            .from('assignment_submissions')
            .select('id, assignment_id')
            .eq('id', formData.submission_id)
            .single();

        if (fetchError) {
            console.error('Error fetching submission for grading:', fetchError);
            throw new Error(`Failed to fetch submission: ${fetchError.message}`);
        }

        // Then check if the teacher has permission to grade this assignment
        if (submission) {
            const { data: assignment, error: assignmentError } = await supabase
                .from('assignments')
                .select('id, class_id')
                .eq('id', submission.assignment_id)
                .single();

            if (assignmentError) {
                console.error('Error fetching assignment:', assignmentError);
                throw new Error(`Failed to fetch assignment: ${assignmentError.message}`);
            }

            if (assignment) {
                const { data: classData, error: classError } = await supabase
                    .from('classes')
                    .select('id, teacher_id')
                    .eq('id', assignment.class_id)
                    .single();

                if (classError) {
                    console.error('Error fetching class:', classError);
                    throw new Error(`Failed to fetch class: ${classError.message}`);
                }

                // Check if teacher has permission to grade this assignment
                if (classData && classData.teacher_id !== user.id) {
                    throw new Error('You do not have permission to grade this submission');
                }
            }
        }

        // Update the submission with grade and feedback
        const { data, error } = await supabase
            .from('assignment_submissions')
            .update({
                grade: formData.grade,
                feedback: formData.feedback,
                status: 'GRADED',
                graded_at: new Date().toISOString()
            })
            .eq('id', formData.submission_id)
            .select()
            .single();

        if (error) {
            if (error.message.includes('row-level security policy')) {
                console.error('RLS policy error:', error);
                throw new Error(
                    'Permission denied: RLS policy issue. Please run this SQL in Supabase: ' +
                    'ALTER TABLE public.assignment_submissions DISABLE ROW LEVEL SECURITY;'
                );
            }
            console.error('Error grading submission:', error);
            throw new Error(`Failed to grade submission: ${error.message}`);
        }

        if (!data) {
            throw new Error('No data returned after grading submission');
        }

        console.log('Submission graded successfully:', {
            submissionId: data.id,
            grade: data.grade,
            status: data.status
        });

        revalidatePath('/dashboard/assignments');
        return data;
    } catch (error) {
        console.error('Error in gradeSubmission:', error);
        throw error;
    }
} 