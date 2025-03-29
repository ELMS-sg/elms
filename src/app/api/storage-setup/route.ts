import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireServerAuth } from '@/lib/actions';

export async function GET(request: Request) {
    try {
        // Only admin users can setup storage
        const user = await requireServerAuth();
        if (user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only administrators can access this endpoint' },
                { status: 403 }
            );
        }

        // Create Supabase client with service role key to ensure full permissions
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    persistSession: false
                }
            }
        );

        console.log('Checking for submission-files bucket...');

        // List all buckets to check if submission-files exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError);
            return NextResponse.json(
                { error: `Failed to list buckets: ${listError.message}` },
                { status: 500 }
            );
        }

        console.log('Existing buckets:', buckets.map(b => b.name));

        const submissionBucket = buckets.find(b => b.name === 'submission-files');

        if (submissionBucket) {
            console.log('submission-files bucket exists!');

            // Return bucket details and public status
            return NextResponse.json({
                status: 'exists',
                bucket: submissionBucket,
                message: 'Submission files bucket already exists'
            });
        }

        console.log('submission-files bucket does not exist, creating it...');

        // Create the bucket if it doesn't exist
        const { data: newBucket, error: createError } = await supabase.storage.createBucket('submission-files', {
            public: true, // Make files accessible without authentication
            fileSizeLimit: 10 * 1024 * 1024, // 10MB file size limit
        });

        if (createError) {
            console.error('Error creating bucket:', createError);
            return NextResponse.json(
                { error: `Failed to create bucket: ${createError.message}` },
                { status: 500 }
            );
        }

        console.log('submission-files bucket created successfully!');

        // Update RLS policies to allow access if needed
        console.log('Setting up public access policies...');

        // Update bucket settings for public access
        const { error: policyError } = await supabase.storage.updateBucket('submission-files', {
            public: true
        });

        if (policyError) {
            console.error('Error setting public policy:', policyError);
            return NextResponse.json({
                status: 'created',
                bucket: newBucket,
                warning: `Bucket created but failed to set public policy: ${policyError.message}`
            });
        }

        console.log('Storage setup completed successfully!');

        return NextResponse.json({
            status: 'created',
            bucket: newBucket,
            message: 'Submission files bucket created successfully with public access'
        });
    } catch (error) {
        console.error('Storage setup error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Internal server error',
                stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
            },
            { status: 500 }
        );
    }
} 