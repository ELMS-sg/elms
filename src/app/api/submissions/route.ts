import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getAssignmentsToGrade } from '@/lib/assignment-actions'
import { requireServerAuth } from '@/lib/actions'

export async function GET(request: NextRequest) {
    try {
        console.log('API /submissions: Request received')

        // Get authenticated user
        const user = await requireServerAuth()
        console.log('API /submissions: User authenticated', user.id, user.role)

        // Only teachers can access this endpoint
        if (user.role !== 'TEACHER') {
            console.log('API /submissions: Unauthorized - user is not a teacher')
            return NextResponse.json(
                { error: 'Unauthorized. Only teachers can access this endpoint.' },
                { status: 403 }
            )
        }

        // Create Supabase client to run direct queries for debugging
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

        // First verify the teacher's classes
        console.log('API /submissions: Checking classes for teacher', user.id)
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select('id, name')
            .eq('teacher_id', user.id)

        if (classesError) {
            console.error('API /submissions: Error fetching classes:', classesError)
        } else {
            console.log('API /submissions: Found classes:', classes?.length || 0)
        }

        if (classes && classes.length > 0) {
            const classIds = classes.map(c => c.id)

            // Check for assignments in these classes
            const { data: assignments, error: assignmentsError } = await supabase
                .from('assignments')
                .select('id, title, class_id')
                .in('class_id', classIds)

            if (assignmentsError) {
                console.error('API /submissions: Error fetching assignments:', assignmentsError)
            } else {
                console.log('API /submissions: Found assignments:', assignments?.length || 0)
            }

            if (assignments && assignments.length > 0) {
                const assignmentIds = assignments.map(a => a.id)

                // Check for submissions to these assignments
                const { data: directSubmissions, error: submissionsError } = await supabase
                    .from('assignment_submissions')
                    .select('id, assignment_id, student_id, status')
                    .in('assignment_id', assignmentIds)

                if (submissionsError) {
                    console.error('API /submissions: Error fetching direct submissions:', submissionsError)
                } else {
                    console.log('API /submissions: Found direct submissions:', directSubmissions?.length || 0)
                    if (directSubmissions && directSubmissions.length > 0) {
                        console.log('API /submissions: First direct submission:', directSubmissions[0])
                    }
                }
            }
        }

        // Fetch submissions data using the existing function
        console.log('API /submissions: Calling getAssignmentsToGrade')
        const submissions = await getAssignmentsToGrade()
        console.log('API /submissions: Got submissions result', {
            count: submissions.length,
            isEmpty: submissions.length === 0
        })

        if (submissions.length === 0) {
            console.log('API /submissions: No submissions found')
        } else {
            console.log('API /submissions: First submission example', JSON.stringify(submissions[0]))
        }

        return NextResponse.json(submissions)
    } catch (error) {
        console.error('Error in /api/submissions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        )
    }
} 