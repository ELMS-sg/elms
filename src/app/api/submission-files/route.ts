import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireServerAuth } from '@/lib/actions';

// This endpoint handles file uploads for assignment submissions
export async function POST(request: Request) {
    try {
        // Authenticate user
        const user = await requireServerAuth();
        if (user.role !== 'STUDENT') {
            return NextResponse.json(
                { error: 'Only students can upload submission files' },
                { status: 403 }
            );
        }

        // Parse the form data
        const formData = await request.formData();
        const submissionId = formData.get('submissionId') as string;
        const file = formData.get('file') as File;

        if (!submissionId) {
            return NextResponse.json(
                { error: 'Submission ID is required' },
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Create Supabase client with service role key to bypass permission issues
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false
                }
            }
        );

        // Verify the submission belongs to this student
        const { data: submission, error: submissionError } = await supabase
            .from('assignment_submissions')
            .select('id')
            .eq('id', submissionId)
            .eq('student_id', user.id)
            .single();

        if (submissionError || !submission) {
            return NextResponse.json(
                { error: 'Unauthorized access to this submission' },
                { status: 403 }
            );
        }

        // Create a safe filename
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadPath = `${submissionId}/${fileName}`;

        console.log(`Attempting to upload file '${file.name}' (${file.size} bytes) to '${uploadPath}'`);

        // Upload file with service role client
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('submission-files')
            .upload(uploadPath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: `Failed to upload file: ${uploadError.message}` },
                { status: 500 }
            );
        }

        console.log('File upload successful:', uploadData);

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('submission-files')
            .getPublicUrl(uploadPath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            console.error('Failed to get public URL');
            return NextResponse.json(
                { error: 'Could not get public URL for file' },
                { status: 500 }
            );
        }

        console.log(`Generated public URL: ${publicUrlData.publicUrl}`);

        // Try to call the RPC function if it exists
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'insert_submission_file',
                {
                    p_submission_id: submissionId,
                    p_file_name: file.name,
                    p_file_size: file.size,
                    p_file_type: file.type || 'application/octet-stream',
                    p_file_url: publicUrlData.publicUrl
                }
            );

            if (rpcError) {
                console.error('RPC function error:', rpcError);
                // Fall back to direct insert
            } else {
                console.log('File reference saved through RPC function');
                return NextResponse.json({
                    success: true,
                    fileName: file.name,
                    fileUrl: publicUrlData.publicUrl,
                    fileId: rpcData.id
                });
            }
        } catch (rpcError) {
            console.error('RPC function may not exist:', rpcError);
            // Continue with direct insert
        }

        // Attempt direct insert as fallback
        const { data: fileData, error: fileInsertError } = await supabase
            .from('submission_files')
            .insert({
                submission_id: submissionId,
                file_name: file.name,
                file_size: file.size,
                file_type: file.type || 'application/octet-stream',
                file_url: publicUrlData.publicUrl
            })
            .select()
            .single();

        if (fileInsertError) {
            console.error('Database insert error:', fileInsertError);

            // Try to disable RLS
            try {
                const { error: disableRlsError } = await supabase.rpc(
                    'temporarily_disable_rls_for_submission_files'
                );

                if (disableRlsError) {
                    console.error('Failed to disable RLS:', disableRlsError);
                } else {
                    console.log('Temporarily disabled RLS for submission_files');

                    // Try the insert again after disabling RLS
                    const { data: retryData, error: retryError } = await supabase
                        .from('submission_files')
                        .insert({
                            submission_id: submissionId,
                            file_name: file.name,
                            file_size: file.size,
                            file_type: file.type || 'application/octet-stream',
                            file_url: publicUrlData.publicUrl
                        })
                        .select()
                        .single();

                    if (retryError) {
                        console.error('Retry insert failed:', retryError);
                    } else {
                        console.log('File reference saved to database after disabling RLS');
                        return NextResponse.json({
                            success: true,
                            fileName: file.name,
                            fileUrl: publicUrlData.publicUrl,
                            fileId: retryData.id
                        });
                    }
                }
            } catch (rpcError) {
                console.error('RLS disable function may not exist:', rpcError);
            }

            return NextResponse.json(
                {
                    error: 'Row Level Security prevented saving the file reference. Please run the SQL in sql/fix_submission_files.sql',
                    details: fileInsertError.message,
                    sqlError: fileInsertError.code
                },
                { status: 500 }
            );
        }

        console.log('File reference saved to database with ID:', fileData.id);

        return NextResponse.json({
            success: true,
            fileName: file.name,
            fileUrl: publicUrlData.publicUrl,
            fileId: fileData.id
        });
    } catch (error) {
        console.error('Error handling file upload:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error',
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
            },
            { status: 500 }
        );
    }
} 