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

        const teacherId = params.id;
        if (!teacherId) {
            return NextResponse.json(
                { error: 'Teacher ID is required' },
                { status: 400 }
            );
        }

        const supabase = await getSupabase();

        // Fetch all classes taught by this teacher
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select(`
                id,
                name,
                description,
                image,
                start_date,
                end_date,
                learning_method,
                max_students,
                tags,
                schedule,
                teacher_id
            `)
            .eq('teacher_id', teacherId)
            .order('created_at', { ascending: false });

        if (classesError) {
            console.error('Error fetching classes:', classesError);
            return NextResponse.json(
                { error: 'Failed to fetch classes' },
                { status: 500 }
            );
        }

        // Get enrollment counts for each class
        const classIds = classes.map(c => c.id);
        const { data: enrollments, error: enrollmentError } = await supabase
            .from('class_enrollments')
            .select('class_id')
            .in('class_id', classIds);

        // Count enrollments per class
        const enrollmentCounts = {};
        if (!enrollmentError && enrollments) {
            enrollments.forEach(enrollment => {
                enrollmentCounts[enrollment.class_id] = (enrollmentCounts[enrollment.class_id] || 0) + 1;
            });
        }

        // Get teacher info
        const { data: teacherData, error: teacherError } = await supabase
            .from('users')
            .select('name')
            .eq('id', teacherId)
            .single();

        if (teacherError) {
            console.error('Error fetching teacher:', teacherError);
            return NextResponse.json(
                { error: 'Failed to fetch teacher data' },
                { status: 500 }
            );
        }

        // Format the class data
        const formattedClasses = classes.map(cls => {
            return {
                id: cls.id,
                name: cls.name,
                description: cls.description,
                teacher: teacherData?.name || 'Unknown',
                teacherId: cls.teacher_id,
                startDate: formatDate(cls.start_date),
                endDate: formatDate(cls.end_date),
                level: "Intermediate",
                learningMethod: cls.learning_method || "Hybrid",
                location: cls.learning_method === 'OFFLINE' ? "Main Campus" : "Online",
                totalStudents: enrollmentCounts[cls.id] || 0,
                maxStudents: cls.max_students || 30,
                image: cls.image,
                tags: cls.tags || ["English", "Language"],
                schedule: cls.schedule || 'Flexible schedule',
            };
        });

        return NextResponse.json(formattedClasses);
    } catch (error) {
        console.error('Error in teacher classes endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 