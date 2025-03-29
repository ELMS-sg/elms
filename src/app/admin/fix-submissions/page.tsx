'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clipboard, AlertTriangle, Check, RefreshCw } from 'lucide-react';

export default function FixSubmissionsPage() {
    const [copied, setCopied] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const sql = `
-- First, disable RLS on the submission_files table
ALTER TABLE public.submission_files DISABLE ROW LEVEL SECURITY;

-- Then create the RPC function that will be used to insert submission files safely
CREATE OR REPLACE FUNCTION public.insert_submission_file(
  p_submission_id uuid,
  p_file_name text,
  p_file_size integer,
  p_file_type text,
  p_file_url text
) RETURNS json AS $$
DECLARE
  v_result json;
BEGIN
  -- Insert the file record
  INSERT INTO public.submission_files(
    submission_id, file_name, file_size, file_type, file_url
  )
  VALUES (
    p_submission_id, p_file_name, p_file_size, p_file_type, p_file_url
  )
  RETURNING to_json(submission_files.*) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create another function to temporarily disable RLS (as a fallback)
CREATE OR REPLACE FUNCTION public.temporarily_disable_rls_for_submission_files() RETURNS void AS $$
BEGIN
  ALTER TABLE public.submission_files DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

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
                body: JSON.stringify({ table: 'submission_files' }),
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
            <h1 className="text-2xl font-bold mb-4">Fix Submission Files RLS Issue</h1>

            <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <AlertTitle>Important Information</AlertTitle>
                <AlertDescription>
                    This page provides the SQL needed to fix Row Level Security (RLS) issues with the
                    submission_files table. You'll need to run this SQL in the Supabase SQL Editor.
                </AlertDescription>
            </Alert>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>SQL Fix for submission_files Table</CardTitle>
                    <CardDescription>
                        Run this SQL in your Supabase SQL Editor to fix RLS issues with file uploads
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