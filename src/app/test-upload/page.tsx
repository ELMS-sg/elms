'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setResult(null);
        setError(null);

        try {
            // Create form data for upload
            const formData = new FormData();
            formData.append('file', file);

            // Make the upload request
            const response = await fetch('/api/test-upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Upload failed');
            } else {
                setResult(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Test File Upload</h1>
            <p className="text-gray-600 mb-4">
                This page tests direct file uploads to Supabase storage.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload Area */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Select File to Upload
                    </label>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                            Click to select a file
                        </p>
                    </div>
                </div>

                {/* Selected File Display */}
                {file && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Selected File
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Success Display */}
                {result && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg flex flex-col">
                        <div className="flex items-start mb-2">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{result.message || 'Upload successful!'}</p>
                        </div>
                        {result.fileUrl && (
                            <div className="mt-2">
                                <p className="text-sm mb-1">File URL:</p>
                                <a
                                    href={result.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm truncate block hover:underline"
                                >
                                    {result.fileUrl}
                                </a>
                            </div>
                        )}
                        <pre className="mt-4 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className={`w-full py-2 px-4 rounded-md ${!file || uploading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } transition-colors flex items-center justify-center`}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload File
                        </>
                    )}
                </button>
            </form>
        </div>
    );
} 