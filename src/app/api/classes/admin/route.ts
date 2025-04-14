import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/actions';
import { getSupabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export async function GET() {
    try {
        // Only admin or teacher can access this endpoint
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const supabase = await getSupabase();

        // Fetch all classes with teacher information
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
        users!classes_teacher_id_fkey (
          id,
          name
        )
      `)
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

        // Format the class data
        const formattedClasses = classes.map(cls => {
            // Debug the class data with focus on teacher information
            const teacherField = cls['users!classes_teacher_id_fkey'];
            console.log(`Class ID: ${cls.id}, Teacher data:`, teacherField);

            let teacherName = 'Unknown';
            let teacherId = '';

            // Check if teacher data exists
            if (teacherField) {
                teacherName = teacherField.name || 'Unknown';
                teacherId = teacherField.id || '';
            }

            return {
                id: cls.id,
                name: cls.name,
                description: cls.description,
                teacher: teacherName,
                teacherId: teacherId,
                startDate: formatDate(cls.start_date),
                endDate: formatDate(cls.end_date),
                level: "Intermediate",
                learningMethod: cls.learning_method || "Hybrid",
                location: "Main Campus",
                totalStudents: enrollmentCounts[cls.id] || 0,
                maxStudents: cls.max_students || 0,
                image: cls.image,
                tags: cls.tags || ["English", "Language"],
                schedule: cls.schedule || 'Flexible schedule',
            };
        });

        return NextResponse.json(formattedClasses);
    } catch (error) {
        console.error('Error in admin classes endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 