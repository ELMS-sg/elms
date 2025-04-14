'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, AlertTriangle, Check, RefreshCw } from 'lucide-react';

export default function FixAssignmentFilesPage() {
    const [copied, setCopied] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const sql = `-- Temporarily disable RLS on assignment_files table
ALTER TABLE public.assignment_files DISABLE ROW LEVEL SECURITY;

-- Create a helper function to safely insert assignment files
CREATE OR REPLACE FUNCTION public.insert_assignment_file(
    assignment_id UUID,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    file_url TEXT
) RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.assignment_files (
        assignment_id,
        file_name,
        file_size,
        file_type,
        file_url
    ) VALUES (
        assignment_id,
        file_name,
        file_size,
        file_type,
        file_url
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to temporarily disable RLS for assignment files operations
CREATE OR REPLACE FUNCTION public.temporarily_disable_rls_for_assignment_files() RETURNS VOID AS $$
BEGIN
    -- Disable RLS for the assignment_files table
    ALTER TABLE public.assignment_files DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fixDirectly = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/fix-rls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table: 'assignment_files'
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
            <h1 className="text-2xl font-bold mb-4">Fix Assignment Files RLS</h1>

            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Assignment Files Upload Issue</AlertTitle>
                <AlertDescription>
                    There may be issues with teachers uploading files to assignments due to Row Level Security (RLS)
                    restrictions in the database. This fix will create helper functions and temporarily disable RLS
                    to allow file uploads to work properly.
                </AlertDescription>
            </Alert>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>SQL Fix for Assignment Files</CardTitle>
                    <CardDescription>
                        Run this SQL in your Supabase SQL Editor to fix the RLS issue
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