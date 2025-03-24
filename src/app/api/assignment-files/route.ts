import { NextResponse } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/client';
import { requireServerAuth } from '@/lib/actions';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const user = await requireServerAuth();
        if (user.role !== 'TEACHER') {
            return NextResponse.json(
                { error: 'Only teachers can upload assignment files' },
                { status: 403 }
            );
        }

        // Parse the form data
        const formData = await request.formData();
        const assignmentId = formData.get('assignmentId') as string;
        const file = formData.get('file') as File;

        if (!assignmentId) {
            return NextResponse.json(
                { error: 'Assignment ID is required' },
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabase = await getSupabaseRouteHandler();

        // Create a safe filename
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadPath = `${assignmentId}/${fileName}`;

        // Upload file directly (no file reading/processing)
        const { error: uploadError } = await supabase.storage
            .from('assignment-files')
            .upload(uploadPath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            return NextResponse.json(
                { error: `Error uploading file: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('assignment-files')
            .getPublicUrl(uploadPath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            return NextResponse.json(
                { error: 'Could not get public URL for file' },
                { status: 500 }
            );
        }

        // Save file reference in database
        const { error: fileInsertError } = await supabase
            .from('assignment_files')
            .insert({
                assignment_id: assignmentId,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type || 'application/octet-stream',
                file_url: publicUrlData.publicUrl
            });

        if (fileInsertError) {
            console.error('Error saving file reference:', fileInsertError);
            return NextResponse.json(
                { error: `Error saving file reference: ${fileInsertError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileUrl: publicUrlData.publicUrl
        });
    } catch (error) {
        console.error('Error handling file upload:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 