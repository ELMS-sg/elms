import { NextResponse } from 'next/server';
import { getSupabaseRouteHandler } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

// A simplified test endpoint for file uploads to isolate storage issues
export async function POST(request: Request) {
    console.log('Test upload endpoint called');

    try {
        // Parse the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Initialize two different Supabase clients to test different auth methods
        const routeHandlerClient = await getSupabaseRouteHandler();

        // Also create direct client with anon key
        const directClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log('File info:', {
            name: file.name,
            size: file.size,
            type: file.type
        });

        const fileName = `test-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadPath = `test/${fileName}`;

        // Try upload with routeHandlerClient first
        console.log('Attempting upload with routeHandlerClient...');
        try {
            const { data: routeData, error: routeError } = await routeHandlerClient.storage
                .from('submission-files')
                .upload(uploadPath, file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (routeError) {
                console.error('RouteHandler client upload error:', routeError);
            } else {
                console.log('RouteHandler client upload successful:', routeData);

                // Get URL
                const { data: urlData } = routeHandlerClient.storage
                    .from('submission-files')
                    .getPublicUrl(uploadPath);

                return NextResponse.json({
                    success: true,
                    message: 'Upload successful with routeHandlerClient',
                    fileUrl: urlData?.publicUrl
                });
            }
        } catch (err) {
            console.error('Exception during routeHandlerClient upload:', err);
        }

        // If we get here, try with direct client
        console.log('Attempting upload with directClient...');
        try {
            const { data: directData, error: directError } = await directClient.storage
                .from('submission-files')
                .upload(`direct-${uploadPath}`, file, {
                    upsert: true,
                    cacheControl: '3600'
                });

            if (directError) {
                console.error('Direct client upload error:', directError);
                return NextResponse.json(
                    {
                        error: 'Both upload methods failed',
                        directError: directError.message,
                    },
                    { status: 500 }
                );
            } else {
                console.log('Direct client upload successful:', directData);

                // Get URL
                const { data: urlData } = directClient.storage
                    .from('submission-files')
                    .getPublicUrl(`direct-${uploadPath}`);

                return NextResponse.json({
                    success: true,
                    message: 'Upload successful with directClient',
                    fileUrl: urlData?.publicUrl
                });
            }
        } catch (err) {
            console.error('Exception during directClient upload:', err);
            return NextResponse.json(
                { error: 'Both upload methods failed with exceptions' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in test upload endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error in test endpoint' },
            { status: 500 }
        );
    }
} 