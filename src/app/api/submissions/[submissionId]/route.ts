import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { requireServerAuth } from '@/lib/actions'

export async function GET(
    request: NextRequest,
    { params }: { params: { submissionId: string } }
) {
    try {
        const submissionId = params.submissionId

        // Authenticate the user
        const user = await requireServerAuth()

        // Get Supabase client
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

        // Fetch the submission with related data
        const { data: submission, error } = await supabase
            .from('assignment_submissions')
            .select(`
        id,
        student_id,
        assignment_id,
        submitted_at,
        content,
        grade,
        feedback,
        status,
        student:student_id (
          id,
          name,
          email,
          avatar_url
        ),
        assignment:assignment_id (
          id,
          title,
          description,
          due_date,
          points,
          assignment_type,
          class_id,
          course:class_id (
            id,
            name
          )
        )
      `)
            .eq('id', submissionId)
            .single()

        if (error) {
            console.error('Error fetching submission:', error)
            return NextResponse.json(
                { error: 'Failed to fetch submission' },
                { status: 500 }
            )
        }

        if (!submission) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            )
        }

        // Check permissions - teachers can view submissions for their classes,
        // students can only view their own
        if (user.role === 'STUDENT' && submission.student_id !== user.id) {
            return NextResponse.json(
                { error: 'You do not have permission to view this submission' },
                { status: 403 }
            )
        }

        // For teachers, verify they teach the class
        if (user.role === 'TEACHER') {
            // Get the class for this assignment
            const { data: classData, error: classError } = await supabase
                .from('classes')
                .select('teacher_id')
                .eq('id', submission.assignment.class_id)
                .single()

            if (classError || !classData) {
                console.error('Error fetching class:', classError)
                return NextResponse.json(
                    { error: 'Failed to verify permissions' },
                    { status: 500 }
                )
            }

            if (classData.teacher_id !== user.id) {
                return NextResponse.json(
                    { error: 'You do not have permission to view this submission' },
                    { status: 403 }
                )
            }
        }

        // Fetch submission files
        const { data: files, error: filesError } = await supabase
            .from('submission_files')
            .select('*')
            .eq('submission_id', submissionId)

        if (filesError) {
            console.error('Error fetching submission files:', filesError)
        }

        // Format the submission data for the client
        const formattedSubmission = {
            id: submission.id,
            submitted_at: submission.submitted_at,
            content: submission.content,
            grade: submission.grade,
            feedback: submission.feedback,
            status: submission.status,
            student: {
                id: submission.student.id,
                name: submission.student.name,
                email: submission.student.email,
                avatar: submission.student.avatar_url
            },
            assignment: {
                id: submission.assignment.id,
                title: submission.assignment.title,
                description: submission.assignment.description,
                due_date: submission.assignment.due_date,
                points: submission.assignment.points,
                assignment_type: submission.assignment.assignment_type,
                course: {
                    id: submission.assignment.course.id,
                    name: submission.assignment.course.name
                }
            },
            files: files || []
        }

        return NextResponse.json(formattedSubmission)
    } catch (error: any) {
        console.error('Error in submission API route:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch submission' },
            { status: 500 }
        )
    }
} 