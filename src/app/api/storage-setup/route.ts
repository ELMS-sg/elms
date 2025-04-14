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

        console.log('Checking for storage buckets...');

        // List all buckets to check if our required buckets exist
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError);
            return NextResponse.json(
                { error: `Failed to list buckets: ${listError.message}` },
                { status: 500 }
            );
        }

        console.log('Existing buckets:', buckets.map(b => b.name));

        // Check and setup submission-files bucket
        const submissionBucket = buckets.find(b => b.name === 'submission-files');
        const assignmentBucket = buckets.find(b => b.name === 'assignment-files');

        const result = {
            status: 'success',
            message: 'Storage buckets check completed',
            buckets: {}
        };

        // Handle submission-files bucket
        if (submissionBucket) {
            console.log('submission-files bucket exists!');
            result.buckets['submission-files'] = {
                status: 'exists',
                bucket: submissionBucket,
                message: 'Submission files bucket already exists'
            };
        } else {
            console.log('submission-files bucket does not exist, creating it...');
            // Create the bucket if it doesn't exist
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('submission-files', {
                public: true, // Make files accessible without authentication
                fileSizeLimit: 10 * 1024 * 1024, // 10MB file size limit
            });

            if (createError) {
                console.error('Error creating submission-files bucket:', createError);
                result.buckets['submission-files'] = {
                    status: 'error',
                    error: `Failed to create bucket: ${createError.message}`
                };
            } else {
                console.log('submission-files bucket created successfully!');

                // Update bucket settings for public access
                const { error: policyError } = await supabase.storage.updateBucket('submission-files', {
                    public: true
                });

                result.buckets['submission-files'] = {
                    status: 'created',
                    bucket: newBucket,
                    message: 'Submission files bucket created successfully with public access',
                    warning: policyError ? `Failed to set public policy: ${policyError.message}` : undefined
                };
            }
        }

        // Handle assignment-files bucket
        if (assignmentBucket) {
            console.log('assignment-files bucket exists!');
            result.buckets['assignment-files'] = {
                status: 'exists',
                bucket: assignmentBucket,
                message: 'Assignment files bucket already exists'
            };
        } else {
            console.log('assignment-files bucket does not exist, creating it...');
            // Create the bucket if it doesn't exist
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('assignment-files', {
                public: true, // Make files accessible without authentication
                fileSizeLimit: 50 * 1024 * 1024, // 50MB file size limit for teacher uploads
            });

            if (createError) {
                console.error('Error creating assignment-files bucket:', createError);
                result.buckets['assignment-files'] = {
                    status: 'error',
                    error: `Failed to create bucket: ${createError.message}`
                };
            } else {
                console.log('assignment-files bucket created successfully!');

                // Update bucket settings for public access
                const { error: policyError } = await supabase.storage.updateBucket('assignment-files', {
                    public: true
                });

                result.buckets['assignment-files'] = {
                    status: 'created',
                    bucket: newBucket,
                    message: 'Assignment files bucket created successfully with public access',
                    warning: policyError ? `Failed to set public policy: ${policyError.message}` : undefined
                };
            }
        }

        console.log('Storage setup completed!');
        return NextResponse.json(result);
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