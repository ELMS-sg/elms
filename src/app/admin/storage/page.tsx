'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X, RefreshCw, AlertTriangle } from 'lucide-react';

export default function StorageAdminPage() {
    const [isChecking, setIsChecking] = useState(false);
    const [bucketStatus, setBucketStatus] = useState<null | {
        status: 'exists' | 'created' | 'error';
        message: string;
        bucket?: any;
        warning?: string;
        error?: string;
    }>(null);
    const router = useRouter();

    // Function to check storage bucket status
    const checkStorageBucket = async () => {
        setIsChecking(true);
        setBucketStatus(null);

        try {
            const response = await fetch('/api/storage-setup');
            const data = await response.json();

            if (response.ok) {
                setBucketStatus({
                    status: data.status,
                    message: data.message,
                    bucket: data.bucket,
                    warning: data.warning
                });
            } else {
                setBucketStatus({
                    status: 'error',
                    message: 'Failed to check storage bucket',
                    error: data.error
                });
            }
        } catch (error) {
            setBucketStatus({
                status: 'error',
                message: 'Error checking storage bucket',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-4">Storage Bucket Management</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Submission Files Bucket</CardTitle>
                    <CardDescription>
                        This is where student assignment submissions are stored. The bucket must exist and be configured correctly for file uploads to work.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {bucketStatus ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">Status:</span>
                                {bucketStatus.status === 'exists' && (
                                    <Badge className="bg-green-500">
                                        <Check className="w-3 h-3 mr-1" /> Exists
                                    </Badge>
                                )}
                                {bucketStatus.status === 'created' && (
                                    <Badge className="bg-blue-500">
                                        <Check className="w-3 h-3 mr-1" /> Created
                                    </Badge>
                                )}
                                {bucketStatus.status === 'error' && (
                                    <Badge className="bg-red-500">
                                        <X className="w-3 h-3 mr-1" /> Error
                                    </Badge>
                                )}
                            </div>

                            <div>
                                <span className="font-semibold">Message:</span>
                                <p className="mt-1">{bucketStatus.message}</p>
                            </div>

                            {bucketStatus.bucket && (
                                <div>
                                    <span className="font-semibold">Bucket Details:</span>
                                    <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-auto">
                                        {JSON.stringify(bucketStatus.bucket, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {bucketStatus.warning && (
                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <AlertTitle>Warning</AlertTitle>
                                    <AlertDescription>{bucketStatus.warning}</AlertDescription>
                                </Alert>
                            )}

                            {bucketStatus.error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{bucketStatus.error}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">
                            Click the button below to check bucket status or create it if needed.
                        </p>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        onClick={checkStorageBucket}
                        disabled={isChecking}
                        className="mr-2"
                    >
                        {isChecking ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Checking...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Check Bucket Status
                            </>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push('/admin')}
                    >
                        Back to Admin
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Troubleshooting</CardTitle>
                </CardHeader>

                <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Make sure your Supabase project has storage enabled.</li>
                        <li>Verify that the service role key has permissions to create and manage buckets.</li>
                        <li>Check the RLS policies in Supabase to ensure that users have the correct permissions for file uploads.</li>
                        <li>For file uploads to work, the bucket must be properly configured for public access.</li>
                    </ul>
                </CardContent>
            </Card>
        </AdminLayout>
    );
} 