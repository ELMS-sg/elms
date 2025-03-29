'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, AlertTriangle, Check, RefreshCw } from 'lucide-react';

export default function FixForeignKeyPage() {
    const [copied, setCopied] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const sql = `-- First, identify the name of the foreign key constraint
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'submission_files' 
AND constraint_type = 'FOREIGN KEY';

-- Then drop the existing constraint
ALTER TABLE public.submission_files 
DROP CONSTRAINT submission_files_submission_id_fkey;

-- Finally, recreate the constraint to point to the correct table
ALTER TABLE public.submission_files
ADD CONSTRAINT submission_files_submission_id_fkey
FOREIGN KEY (submission_id)
REFERENCES public.assignment_submissions(id)
ON DELETE CASCADE;

-- Confirm the constraint was created correctly (with qualified column names)
SELECT 
    rc.constraint_name, 
    kcu.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name, 
    ccu.column_name AS foreign_column_name
FROM information_schema.constraint_column_usage ccu
JOIN information_schema.referential_constraints rc 
    ON ccu.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = rc.constraint_name
WHERE kcu.table_name = 'submission_files';`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fixDirectly = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/fix-foreign-key', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table: 'submission_files',
                    column: 'submission_id',
                    referenced_table: 'assignment_submissions',
                    referenced_column: 'id'
                }),
            });
            const data = await response.json();
            setResponse(data);
        } catch (error) {
            setResponse({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-4">Fix Foreign Key Constraint Issue</h1>

            <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle>Database Schema Error</AlertTitle>
                <AlertDescription>
                    There's a foreign key constraint issue with the submission_files table. The constraint is currently
                    pointing to a table called 'submissions', but it should be pointing to 'assignment_submissions'.
                    This is causing file uploads to fail with error code 23503.
                </AlertDescription>
            </Alert>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>SQL Fix for Foreign Key Constraint</CardTitle>
                    <CardDescription>
                        Run this SQL in your Supabase SQL Editor to fix the foreign key constraint
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="bg-gray-800 text-gray-100 p-4 rounded overflow-auto">
                        <pre className="whitespace-pre-wrap text-sm">{sql}</pre>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button
                        onClick={copyToClipboard}
                        className="flex-1"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Clipboard className="w-4 h-4 mr-2" />
                                Copy SQL to Clipboard
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={fixDirectly}
                        variant="outline"
                        className="flex-1"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Applying Fix...
                            </>
                        ) : (
                            <>
                                Apply Fix Directly
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {response && (
                <Card className={response.success ? "bg-green-50" : "bg-red-50"}>
                    <CardHeader>
                        <CardTitle>{response.success ? "Success" : "Error"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="whitespace-pre-wrap text-sm p-3 bg-white rounded">
                            {JSON.stringify(response, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}

            <div className="mt-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin')}
                >
                    Back to Admin Dashboard
                </Button>
            </div>
        </AdminLayout>
    );
} 