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
                        startDate: new Date(classData.start_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        endDate: new Date(classData.end_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        // These fields would need to be added to the database in a real implementation
                        level: "Intermediate",
                        learningMethod: "Hybrid",
                        location: "Main Campus",
                        totalStudents: 0,
                        image: "/images/ielts-academic.jpg",
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
            // Use type assertion to tell TypeScript that classes is a single object, not an array
            const classData = enrollment.classes as any;
            const teacher = classData.users as any;

            return {
                id: classData.id,
                name: classData.name,
                description: classData.description,
                teacher: teacher.name,
                teacherId: classData.teacher_id,
                startDate: new Date(classData.start_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                endDate: new Date(classData.end_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                // These fields would need to be added to the database in a real implementation
                level: "Intermediate",
                learningMethod: "Hybrid",
                location: "Main Campus",
                totalStudents: 0,
                image: "/images/ielts-academic.jpg",
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
            startDate: new Date(cls.start_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            endDate: new Date(cls.end_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            level: "Intermediate",
            learningMethod: "Hybrid",
            location: "Main Campus",
            totalStudents: studentCountMap[cls.id] || 0,
            image: "/images/ielts-academic.jpg",
            tags: ["IELTS", "Academic"],
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
            teacher_id,
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
                name
            )
        `)
        .eq('class_id', classId)

    if (enrollmentError) {
        console.error('Error fetching enrollments:', enrollmentError)
    }

    // Format the students data
    const students = enrollments ? enrollments.map(enrollment => {
        // Use type assertion to tell TypeScript that users is a single object, not an array
        const userData = enrollment.users as any;
        return {
            id: userData.id,
            name: userData.name,
            avatar: null // This would need to be added to the database in a real implementation
        };
    }) : []

    // Format the class data to match the frontend expectations
    return {
        id: classData.id,
        name: classData.name,
        description: classData.description,
        // Use type assertion for the teacher data
        teacher: (classData.users as any).name,
        teacherId: classData.teacher_id,
        teacherTitle: "IELTS Examiner & Senior Instructor", // This would need to be added to the database
        teacherImage: "/images/teacher-sarah.jpg", // This would need to be added to the database
        startDate: new Date(classData.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        endDate: new Date(classData.end_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        // These fields would need to be added to the database in a real implementation
        level: "Intermediate (B1-B2)",
        schedule: "Tuesdays and Thursdays, 6:00 PM - 8:00 PM",
        learningMethod: "Hybrid",
        location: "Main Campus, Room 204",
        totalStudents: students.length,
        maxStudents: 20,
        image: "/images/ielts-academic.jpg",
        tags: ["IELTS", "Academic"],
        syllabus: [
            "Week 1-2: Introduction to IELTS & Listening Skills",
            "Week 3-4: Reading Strategies & Practice",
            "Week 5-6: Writing Task 1 - Charts and Graphs",
            "Week 7-8: Writing Task 2 - Essays",
            "Week 9-10: Speaking Parts 1-3",
            "Week 11-12: Mock Tests & Final Review"
        ],
        materials: [
            "Official IELTS Practice Materials",
            "Cambridge IELTS 15-17",
            "Custom Vocabulary Workbook",
            "Online Practice Tests"
        ],
        students
    }
}

/**
 * Get all available classes (for enrollment)
 */
export async function getAvailableClasses() {
    const user = await requireServerAuth()
    const supabase = await getSupabase()

    // Get all classes
    const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select(`
            id,
            name,
            description,
            teacher_id,
            start_date,
            end_date,
            users!classes_teacher_id_fkey (
                id,
                name
            )
        `)

    if (classesError) {
        console.error('Error fetching classes:', classesError)
        return []
    }

    // If the user is a student, get their enrollments to filter out classes they're already enrolled in
    let enrolledClassIds = []
    if (user.role === 'STUDENT') {
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select('class_id')
            .eq('student_id', user.id)

        if (enrollmentError) {
            console.error('Error fetching enrollments:', enrollmentError)
        } else {
            enrolledClassIds = enrollments.map(e => e.class_id)
        }
    }

    // Filter out classes the student is already enrolled in
    const availableClasses = classes.filter(cls => !enrolledClassIds.includes(cls.id))

    // Format the data to match the frontend expectations
    return availableClasses.map(cls => ({
        id: cls.id,
        name: cls.name,
        description: cls.description,
        // Use type assertion for the teacher data
        teacher: (cls.users as any).name,
        teacherId: cls.teacher_id,
        startDate: new Date(cls.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        endDate: new Date(cls.end_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        // These fields would need to be added to the database in a real implementation
        level: "Intermediate",
        learningMethod: "Hybrid",
        location: "Main Campus",
        totalStudents: 0,
        image: "/images/ielts-academic.jpg",
        tags: ["IELTS", "Academic"],
    }))
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