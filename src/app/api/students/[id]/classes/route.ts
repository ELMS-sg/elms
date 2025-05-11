import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Only admins can access this endpoint.' },
                { status: 403 }
            );
        }

        const studentId = params.id;
        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        const supabase = await getSupabase();

        // Get student information first to verify they exist
        const { data: student, error: studentError } = await supabase
            .from('users')
            .select('id, name, role')
            .eq('id', studentId)
            .eq('role', 'STUDENT')
            .single();

        if (studentError || !student) {
            console.error('Error fetching student:', studentError);
            return NextResponse.json(
                { error: 'Student not found or not a student' },
                { status: 404 }
            );
        }

        // Fetch all classes the student is enrolled in via class_enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
            .from('class_enrollments')
            .select(`
                id,
                class_id,
                classes (
                    id,
                    name,
                    description,
                    image,
                    start_date,
                    end_date,
                    learning_method,
                    max_students,
                    schedule,
                    teacher_id,
                    users!classes_teacher_id_fkey (
                        id,
                        name
                    )
                )
            `)
            .eq('student_id', studentId);

        if (enrollmentsError) {
            console.error('Error fetching enrollments:', enrollmentsError);
            return NextResponse.json(
                { error: 'Failed to fetch enrollments' },
                { status: 500 }
            );
        }

        // Format the class data
        const formattedClasses = enrollments.map(enrollment => {
            const classData = enrollment.classes as any;
            const teacher = classData?.users as any;

            return {
                id: classData.id,
                name: classData.name,
                description: classData.description,
                teacher: teacher ? teacher.name : 'Unknown',
                teacherId: classData.teacher_id,
                startDate: formatDate(classData.start_date),
                endDate: formatDate(classData.end_date),
                level: "Intermediate",
                learningMethod: classData.learning_method || "Hybrid",
                location: classData.learning_method === 'OFFLINE' ? "Main Campus" : "Online",
                totalStudents: 0, // Would need another query to count all enrollments in this class
                maxStudents: classData.max_students || 30,
                image: classData.image,
                tags: ["English", "Language"], // Would need to fetch real tags
                schedule: classData.schedule || 'Flexible schedule',
            };
        });

        return NextResponse.json(formattedClasses);
    } catch (error) {
        console.error('Error in student classes endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 