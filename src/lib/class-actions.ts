'use server'

import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { requireServerAuth } from './actions'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { Database } from '@/types/supabase'
import { formatDate } from './utils'

// Helper function to get Supabase client - cached to avoid multiple instantiations
const getSupabase = cache(() => {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
})

/**
 * Create sample class data for a new user
 * This is used to ensure new users have data to see
 */
export async function createSampleClassData(userId: string, userRole: string) {
    const supabase = await getSupabase()

    try {
        console.log('createSampleClassData: Starting function for user', userId, userRole)

        // Only create sample data for students
        if (userRole !== 'STUDENT') {
            console.log('createSampleClassData: Skipping for non-student user')
            return
        }

        // Check if user already has enrollments
        const { data: existingEnrollments, error: checkError } = await supabase
            .from('class_enrollments')
            .select('*')
            .eq('student_id', userId)

        if (checkError) {
            console.error('Error checking existing enrollments:', checkError)
            return
        }

        if (!checkError && existingEnrollments && existingEnrollments.length > 0) {
            console.log('createSampleClassData: User already has enrollments, skipping')
            return
        }

        // Get some classes to enroll the user in
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select('id')
            .limit(3)

        if (classesError || !classes || classes.length === 0) {
            console.log('createSampleClassData: No classes found to enroll user in')

            // Create a sample class if none exist
            const { data: teacher, error: teacherError } = await supabase
                .from('users')
                .select('id')
                .eq('role', 'TEACHER')
                .limit(1)

            let teacherId = null

            if (teacherError || !teacher || teacher.length === 0) {
                // Create a sample teacher if none exist
                const { data: newTeacher, error: createTeacherError } = await supabase
                    .from('users')
                    .insert({
                        email: 'teacher@example.com',
                        name: 'Sample Teacher',
                        role: 'TEACHER'
                    })
                    .select('id')
                    .single()

                if (createTeacherError) {
                    console.error('Error creating sample teacher:', createTeacherError)
                    return
                }

                teacherId = newTeacher.id
            } else {
                teacherId = teacher[0].id
            }

            // Create a sample class
            const startDate = new Date()
            const endDate = new Date()
            endDate.setMonth(endDate.getMonth() + 3)

            const { data: newClass, error: createClassError } = await supabase
                .from('classes')
                .insert({
                    name: 'Introduction to English',
                    description: 'A beginner-friendly course covering the basics of English language.',
                    teacher_id: teacherId,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString()
                })
                .select('id')
                .single()

            if (createClassError) {
                console.error('Error creating sample class:', createClassError)
                return
            }

            // Enroll the user in the new class
            const { error: enrollError } = await supabase
                .from('class_enrollments')
                .insert({
                    student_id: userId,
                    class_id: newClass.id,
                    enrolled_at: new Date().toISOString()
                })

            if (enrollError) {
                console.error('Error enrolling user in sample class:', enrollError)
            } else {
                console.log('createSampleClassData: Enrolled user in newly created sample class')
            }

            return
        }

        // Enroll the user in existing classes
        for (const cls of classes) {
            const { error: enrollError } = await supabase
                .from('class_enrollments')
                .insert({
                    student_id: userId,
                    class_id: cls.id,
                    enrolled_at: new Date().toISOString()
                })

            if (enrollError) {
                console.error('Error enrolling user in class:', enrollError, cls.id)
            }
        }

        console.log('createSampleClassData: Enrolled user in', classes.length, 'classes')
    } catch (error) {
        console.error('Exception in createSampleClassData:', error)
    }
}

/**
 * Get all classes for a student (classes they are enrolled in)
 */
export async function getStudentClasses() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    try {
        console.log('getStudentClasses: Starting function')
        console.log('getStudentClasses: User authenticated', user.id, user.role)

        if (user.role !== 'STUDENT') {
            console.log('getStudentClasses: User is not a student, returning empty array')
            return []
        }

        // Get the classes the student is enrolled in
        console.log('getStudentClasses: Fetching enrollments for student', user.id)
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select(`
                id,
                class_id,
                classes (
                    id,
                    name,
                    image,
                    description,
                    teacher_id,
                    start_date,
                    end_date,
                    users!classes_teacher_id_fkey (
                        id,
                        name
                    )
                )
            `)
            .eq('student_id', user.id)

        if (enrollmentError) {
            console.error('Error fetching enrollments:', enrollmentError)
            return []
        }

        console.log('getStudentClasses: Enrollments fetched', enrollments?.length || 0)

        // If no enrollments found, try to create sample data
        if (!enrollments || enrollments.length === 0) {
            console.log('getStudentClasses: No enrollments found, attempting to create sample data')

            try {
                // Create sample class enrollments for the user
                await createSampleClassData(user.id, user.role)

                // Try fetching enrollments again
                const { data: newEnrollments, error: newEnrollmentError } = await supabase
                    .from('class_enrollments')
                    .select(`
                        id,
                        class_id,
                        classes (
                            id,
                            name,
                            image,
                            description,
                            teacher_id,
                            start_date,
                            end_date,
                            users!classes_teacher_id_fkey (
                                id,
                                name
                            )
                        )
                    `)
                    .eq('student_id', user.id)

                if (newEnrollmentError) {
                    console.error('Error fetching new enrollments:', newEnrollmentError)
                    return []
                }

                if (!newEnrollments || newEnrollments.length === 0) {
                    console.log('getStudentClasses: Still no enrollments found after creating sample data')
                    return []
                }

                console.log('getStudentClasses: New enrollments fetched after creating sample data', newEnrollments.length)

                // Format the data to match the frontend expectations
                const formattedClasses = newEnrollments.map(enrollment => {
                    // Use type assertion to tell TypeScript that classes is a single object, not an array
                    const classData = enrollment.classes as any;
                    const teacher = classData.users as any;

                    return {
                        id: classData.id,
                        name: classData.name,
                        description: classData.description,
                        teacher: teacher.name,
                        teacherId: classData.teacher_id,
                        startDate: formatDate(classData.start_date),
                        endDate: formatDate(classData.end_date),
                        // These fields would need to be added to the database in a real implementation
                        level: "Intermediate",
                        learningMethod: "Hybrid",
                        location: "Main Campus",
                        totalStudents: 0,
                        image: classData.image,
                        tags: ["IELTS", "Academic"],
                    };
                });

                console.log('getStudentClasses: Returning formatted classes after creating sample data', formattedClasses.length)
                return formattedClasses;
            } catch (error) {
                console.error('Error creating sample data in getStudentClasses:', error)
                return []
            }
        }

        // Format the data to match the frontend expectations
        const formattedClasses = enrollments.map(enrollment => {
            const classData = enrollment.classes as any;
            const teacher = classData.users as any;

            return {
                id: classData.id,
                name: classData.name,
                description: classData.description,
                teacher: teacher.name,
                teacherId: classData.teacher_id,
                startDate: formatDate(classData.start_date),
                endDate: formatDate(classData.end_date),
                level: "Intermediate",
                learningMethod: "Hybrid",
                location: "Main Campus",
                totalStudents: 0,
                image: classData.image,
                tags: ["IELTS", "Academic"],
            };
        });

        console.log('getStudentClasses: Returning formatted classes', formattedClasses.length)
        return formattedClasses;
    } catch (error) {
        console.error('Exception in getStudentClasses:', error)
        return []
    }
}

/**
 * Get all classes for a teacher (classes they teach)
 */
export async function getTeacherClasses() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    if (user.role !== 'TEACHER') {
        console.log('getTeacherClasses: User is not a teacher, returning empty array')
        return []
    }

    try {
        // Get the classes the teacher is teaching
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select(`
                id,
                name,
                description,
                image,
                start_date,
                end_date
            `)
            .eq('teacher_id', user.id)

        if (classesError) {
            console.error('Error fetching classes:', classesError)
            return []
        }

        // Get the number of students enrolled in each class
        const classIds = classes.map(c => c.id)

        // Use a raw SQL query to get the enrollment counts
        const { data: enrollmentCounts, error: enrollmentError } = await supabase
            .rpc('get_enrollment_counts_by_class', { class_ids: classIds })
            .select()

        // If the RPC function doesn't exist, we'll just use an empty object for counts
        let studentCountMap = {}

        if (enrollmentError) {
            console.error('Error fetching enrollment counts:', enrollmentError)
            // Fallback: Just count enrollments manually without grouping
            const { data: allEnrollments } = await supabase
                .from('class_enrollments')
                .select('class_id')
                .in('class_id', classIds)

            if (allEnrollments) {
                // Count manually
                studentCountMap = allEnrollments.reduce((acc, enrollment) => {
                    acc[enrollment.class_id] = (acc[enrollment.class_id] || 0) + 1
                    return acc
                }, {})
            }
        } else if (enrollmentCounts) {
            enrollmentCounts.forEach(count => {
                studentCountMap[count.class_id] = count.count
            })
        }

        return classes.map(cls => ({
            id: cls.id,
            name: cls.name,
            description: cls.description,
            teacher: user.name,
            teacherId: user.id,
            startDate: formatDate(cls.start_date),
            endDate: formatDate(cls.end_date),
            level: "Intermediate",
            learningMethod: "Hybrid",
            location: "Main Campus",
            totalStudents: studentCountMap[cls.id] || 0,
            tags: ["IELTS", "Academic"],
            image: cls.image,
        }))
    } catch (error) {
        console.error('Exception in getTeacherClasses:', error)
        return []
    }
}

/**
 * Get a specific class by ID
 */
export async function getClassById(classId: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    // Get the class details
    const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
            id,
            name,
            description,
            image,
            meeting_url,
            contact_group,
            schedule,
            learning_method,
            max_students,
            enrolled_count,
            tags,
            teacher_id (
                id,
                name,
                avatar_url
            ),
            start_date,
            end_date,
            users!classes_teacher_id_fkey (
                id,
                name
            )
        `)
        .eq('id', classId)
        .single()

    if (classError) {
        console.error('Error fetching class:', classError)
        return null
    }

    // Get the students enrolled in this class
    const { data: enrollments, error: enrollmentError } = await supabase
        .from('class_enrollments')
        .select(`
            id,
            student_id,
            users!class_enrollments_student_id_fkey (
                id,
                name,
                avatar_url
            )
        `)
        .eq('class_id', classId)

    if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError)
    }

    // Format the students data
    const students = enrollments ? enrollments.map(enrollment => {
        const userData = enrollment.users as any;
        return {
            id: userData.id,
            name: userData.name,
            avatar: userData.avatar_url
        };
    }) : []

    // Format the class data to match the frontend expectations
    return {
        id: classData.id,
        name: classData.name,
        description: classData.description,
        teacher: (classData.users as any).name,
        teacherId: classData.teacher_id,
        teacherTitle: "Instructor", // This could be added to the users table in the future
        teacherImage: (classData.teacher_id as any).avatar_url,
        startDate: formatDate(classData.start_date),
        endDate: formatDate(classData.end_date),
        image: classData.image,
        meetingUrl: classData.meeting_url,
        contactGroup: classData.contact_group,
        level: "Intermediate", // This could be added to the classes table in the future
        schedule: classData.schedule,
        learningMethod: classData.learning_method,
        location: classData.learning_method === 'OFFLINE' ? "Main Campus" : "Online",
        totalStudents: students.length,
        maxStudents: classData.max_students,
        tags: classData.tags || [],
        students
    }
}

/**
 * Get all available classes (for enrollment)
 */
export async function getAvailableClasses() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    // Get current date in ISO format
    const today = new Date().toISOString().split('T')[0]

    // Get all classes with enrollment counts
    const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select(`
            id,
            name,
            image,
            description,
            teacher_id,
            start_date,
            end_date,
            max_students,
            users!classes_teacher_id_fkey (
                id,
                name
            )
        `)
        .gte('end_date', today) // Only get classes that haven't ended yet

    if (classesError) {
        console.error('Error fetching classes:', classesError)
        return []
    }

    // Get enrollment counts for each class
    const classIds = classes.map(c => c.id)
    const { data: enrollmentCounts, error: countError } = await supabase
        .from('class_enrollments')
        .select('class_id')
        .in('class_id', classIds)

    if (countError) {
        console.error('Error fetching enrollment counts:', countError)
        return []
    }

    // Create a map of enrollment counts
    const enrollmentMap = enrollmentCounts.reduce((acc, e) => {
        acc[e.class_id] = (acc[e.class_id] || 0) + 1
        return acc
    }, {})

    // If the user is a student, get their enrollments and requests
    let enrolledClassIds = []
    let requestedClassIds = []
    if (user.role === 'STUDENT') {
        // Get enrollments
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select('class_id')
            .eq('student_id', user.id)

        if (!enrollmentError) {
            enrolledClassIds = enrollments.map(e => e.class_id)
        }

        // Get pending requests
        const { data: requests, error: requestError } = await supabase
            .from('enrollment_requests')
            .select('class_id')
            .eq('student_id', user.id)
            .eq('status', 'pending')

        if (!requestError) {
            requestedClassIds = requests.map(r => r.class_id)
        }
    }

    // Filter and format classes
    const availableClasses = classes
        .filter(cls => !enrolledClassIds.includes(cls.id))
        .map(cls => {
            const currentStudents = enrollmentMap[cls.id] || 0
            const teacher = (cls.users as unknown as Database['public']['Tables']['users']['Row'])

            return {
                id: cls.id,
                name: cls.name,
                description: cls.description,
                teacher: teacher.name,
                teacherId: cls.teacher_id,
                startDate: formatDate(cls.start_date),
                endDate: formatDate(cls.end_date),
                image: cls.image,
                currentStudents,
                maxStudents: cls.max_students,
                hasCapacity: currentStudents < cls.max_students,
                hasPendingRequest: requestedClassIds.includes(cls.id)
            }
        })

    return availableClasses
}

/**
 * Enroll a student in a class
 */
export async function enrollInClass(classId: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    if (user.role !== 'STUDENT') {
        throw new Error('Only students can enroll in classes')
    }

    // Check if the student is already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
        .from('class_enrollments')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', user.id)
        .single()

    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking enrollment:', checkError)
        throw new Error('Failed to check enrollment status')
    }

    if (existingEnrollment) {
        throw new Error('You are already enrolled in this class')
    }

    // Enroll the student
    const { error: enrollError } = await supabase
        .from('class_enrollments')
        .insert({
            class_id: classId,
            student_id: user.id,
            enrolled_at: new Date().toISOString()
        })

    if (enrollError) {
        console.error('Error enrolling in class:', enrollError)
        throw new Error('Failed to enroll in class')
    }

    // Revalidate the classes page to show the updated enrollment
    revalidatePath('/dashboard/classes')

    return { success: true }
}

/**
 * Unenroll a student from a class
 */
export async function unenrollFromClass(classId: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    if (user.role !== 'STUDENT') {
        throw new Error('Only students can unenroll from classes')
    }

    // Delete the enrollment
    const { error: deleteError } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', user.id)

    if (deleteError) {
        console.error('Error unenrolling from class:', deleteError)
        throw new Error('Failed to unenroll from class')
    }

    // Revalidate the classes page to show the updated enrollment
    revalidatePath('/dashboard/classes')

    return { success: true }
}

/**
 * Update the contact group link for a class
 */
export async function updateContactGroup(classId: string, contactGroup: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    // Only teachers can update the contact group
    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can update the contact group')
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
        throw new Error('You can only update contact group for your own classes')
    }

    // Update the contact group
    const { error: updateError } = await supabase
        .from('classes')
        .update({ contact_group: contactGroup })
        .eq('id', classId)

    if (updateError) {
        console.error('Error updating contact group:', updateError)
        throw new Error('Failed to update contact group')
    }

    // Revalidate the class page
    revalidatePath(`/dashboard/classes/${classId}`)

    return { success: true }
}

/**
 * Request enrollment in a class
 */
export async function requestEnrollment(classId: string, message: string = '') {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    if (user.role !== 'STUDENT') {
        throw new Error('Only students can request enrollment in classes')
    }

    // Check if the student already has a pending request
    const { data: existingRequest, error: checkError } = await supabase
        .from('enrollment_requests')
        .select('id, status')
        .eq('class_id', classId)
        .eq('student_id', user.id)
        .single()

    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking enrollment request:', checkError)
        throw new Error('Failed to check enrollment request status')
    }

    if (existingRequest) {
        if (existingRequest.status === 'pending') {
            throw new Error('You already have a pending request for this class')
        } else if (existingRequest.status === 'approved') {
            throw new Error('You are already enrolled in this class')
        }
    }

    // Create the enrollment request
    const { error: requestError } = await supabase
        .from('enrollment_requests')
        .insert({
            class_id: classId,
            student_id: user.id,
            message,
            status: 'pending',
            requested_at: new Date().toISOString()
        })

    if (requestError) {
        console.error('Error creating enrollment request:', requestError)
        throw new Error('Failed to create enrollment request')
    }

    return { success: true }
}

/**
 * Handle enrollment request (approve/reject)
 */
export async function handleEnrollmentRequest(requestId: string, action: 'approve' | 'reject', reason?: string) {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    if (user.role !== 'TEACHER') {
        throw new Error('Only teachers can handle enrollment requests')
    }

    // Get the request details
    const { data: request, error: requestError } = await supabase
        .from('enrollment_requests')
        .select(`
            id,
            class_id,
            student_id,
            classes:class_id (
                id,
                teacher_id
            )
        `)
        .eq('id', requestId)
        .single()

    if (requestError) {
        console.error('Error fetching request:', requestError)
        throw new Error('Failed to fetch request details')
    }

    const classData = (request.classes as unknown as Database['public']['Tables']['classes']['Row'])

    // Verify the teacher owns the class
    if (classData.teacher_id !== user.id) {
        throw new Error('You can only handle requests for your own classes')
    }

    if (action === 'approve') {
        // Create the enrollment
        const { error: enrollError } = await supabase
            .from('class_enrollments')
            .insert({
                class_id: request.class_id,
                student_id: request.student_id,
                enrolled_at: new Date().toISOString()
            })

        if (enrollError) {
            console.error('Error enrolling student:', enrollError)
            throw new Error('Failed to enroll student')
        }
    }

    // Update the request status
    const { error: updateError } = await supabase
        .from('enrollment_requests')
        .update({
            status: action === 'approve' ? 'approved' : 'rejected',
            response_message: reason,
            responded_at: new Date().toISOString()
        })
        .eq('id', requestId)

    if (updateError) {
        console.error('Error updating request:', updateError)
        throw new Error('Failed to update request status')
    }

    // Revalidate the classes page
    revalidatePath('/dashboard/classes')

    return { success: true }
}

/**
 * Get enrollment requests for a teacher's classes
 */
export async function getEnrollmentRequests() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    if (user.role !== 'TEACHER') {
        return []
    }

    const { data: requests, error: requestError } = await supabase
        .from('enrollment_requests')
        .select(`
            id,
            message,
            status,
            requested_at,
            responded_at,
            response_message,
            class_id (
                id,
                name
            ),
            student_id (
                id,
                name,
                avatar_url
            )
        `)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })

    if (requestError) {
        console.error('Error fetching enrollment requests:', requestError)
        return []
    }

    return requests
} 