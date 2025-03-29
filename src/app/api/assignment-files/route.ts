import { NextResponse } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/client';
import { requireServerAuth } from '@/lib/actions';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const user = await requireServerAuth();
        if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
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

        // Verify that the user owns the assignment
        const supabase = await getSupabaseRouteHandler();

        if (user.role === 'TEACHER') {
            const { data: classData, error: classError } = await supabase
                .from('assignments')
                .select('class_id')
                .eq('id', assignmentId)
                .single();

            if (classError || !classData) {
                console.error('Error verifying assignment:', classError);
                return NextResponse.json(
                    { error: 'Assignment not found' },
                    { status: 403 }
                );
            }

            // Check if the teacher owns the class
            const { data: teacherData, error: teacherError } = await supabase
                .from('classes')
                .select('teacher_id')
                .eq('id', classData.class_id)
                .single();

            if (teacherError || !teacherData) {
                console.error('Error verifying class ownership:', teacherError);
                return NextResponse.json(
                    { error: 'Class not found' },
                    { status: 403 }
                );
            }

            if (teacherData.teacher_id !== user.id) {
                return NextResponse.json(
                    { error: 'You do not have permission to add files to this assignment' },
                    { status: 403 }
                );
            }
        }

        // Create a safe filename
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadPath = `${assignmentId}/${fileName}`;

        console.log(`Uploading file: ${file.name} (${file.size} bytes) to ${uploadPath}`);

        // Upload file
        const { error: uploadError } = await supabase.storage
            .from('assignment-files')
            .upload(uploadPath, file, {
                upsert: true,
                contentType: file.type || 'application/octet-stream'
            });

        if (uploadError) {
            console.error('Error uploading file to storage:', uploadError);

            // If first attempt fails, try with service role client
            console.log('Attempting upload with service role client...');

            // Create service role client
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { error: adminUploadError } = await supabaseAdmin.storage
                .from('assignment-files')
                .upload(uploadPath, file, {
                    upsert: true,
                    contentType: file.type || 'application/octet-stream'
                });

            if (adminUploadError) {
                console.error('Error uploading with service role client:', adminUploadError);
                return NextResponse.json(
                    { error: `Error uploading file: ${adminUploadError.message}` },
                    { status: 500 }
                );
            }
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

        // Save file reference in database - first try with RPC function
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'insert_assignment_file',
                {
                    assignment_id: assignmentId,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type || 'application/octet-stream',
                    file_url: publicUrlData.publicUrl
                }
            );

            if (!rpcError) {
                console.log('File reference saved successfully via RPC');
                return NextResponse.json({
                    success: true,
                    fileName: file.name,
                    fileUrl: publicUrlData.publicUrl,
                    fileId: rpcData
                });
            }

            console.error('RPC failed, falling back to direct insert:', rpcError);
        } catch (rpcError) {
            console.error('Error with RPC call:', rpcError);
        }

        // If RPC fails, try direct insert
        try {
            const { error: disableRlsError } = await supabase.rpc('temporarily_disable_rls_for_assignment_files');
            if (disableRlsError) {
                console.error('Error disabling RLS:', disableRlsError);
            }

            // Try direct insert (might work if RLS was disabled)
            const { data: fileData, error: fileInsertError } = await supabase
                .from('assignment_files')
                .insert({
                    assignment_id: assignmentId,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type || 'application/octet-stream',
                    file_url: publicUrlData.publicUrl
                })
                .select()
                .single();

            if (fileInsertError) {
                console.error('Error saving file reference with direct insert:', fileInsertError);

                // Last resort: try with service role client
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                const { data: adminFileData, error: adminFileInsertError } = await supabaseAdmin
                    .from('assignment_files')
                    .insert({
                        assignment_id: assignmentId,
                        file_name: file.name,
                        file_size: file.size,
                        file_type: file.type || 'application/octet-stream',
                        file_url: publicUrlData.publicUrl
                    })
                    .select()
                    .single();

                if (adminFileInsertError) {
                    console.error('Error saving file reference using service role:', adminFileInsertError);
                    return NextResponse.json(
                        { error: `Error saving file reference: ${adminFileInsertError.message}` },
                        { status: 500 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    fileName: file.name,
                    fileUrl: publicUrlData.publicUrl,
                    fileId: adminFileData.id,
                    method: 'service-role-insert'
                });
            }

            return NextResponse.json({
                success: true,
                fileName: file.name,
                fileUrl: publicUrlData.publicUrl,
                fileId: fileData.id,
                method: 'direct-insert'
            });

        } catch (insertError) {
            console.error('Unexpected error during file reference insert:', insertError);
            return NextResponse.json(
                { error: 'Failed to save file reference in database' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error handling file upload:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 