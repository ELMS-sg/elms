'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createAssignment } from '@/lib/assignment-actions'
import { AssignmentFormData } from '@/types/assignments'
import {
    Upload,
    File,
    X,
    AlertCircle,
    CheckCircle,
    Loader2,
    Calendar,
} from 'lucide-react'

interface CreateAssignmentFormProps {
    classes: Array<{
        id: string
        name: string
    }>
}

export default function CreateAssignmentForm({ classes }: CreateAssignmentFormProps) {
    const router = useRouter()
    const [formData, setFormData] = useState<Partial<AssignmentFormData>>({
        title: '',
        description: '',
        class_id: classes.length > 0 ? classes[0].id : '',
        due_date: '',
        points: 100,
        assignment_type: 'exercise'
    })
    const [files, setFiles] = useState<File[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'points' ? parseInt(value, 10) || 0 : value
        }))
    }

    const validateFile = (file: File): boolean => {
        // Check if file is valid
        if (!file || !file.name || !file.size) {
            console.error('Invalid file object', file);
            return false;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError(`File ${file.name} is too large (max 10MB)`);
            return false;
        }

        // Acceptable file types (add more as needed)
        const acceptableTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        // Check file type - but be lenient if type is not recognized
        if (file.type && !acceptableTypes.includes(file.type)) {
            console.warn(`File type ${file.type} may not be supported`);
            // We'll still accept it, just log a warning
        }

        return true;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Clear any previous errors
            setError(null);

            const fileList = Array.from(e.target.files);
            console.log(`Received ${fileList.length} files`);

            // Validate each file before adding
            const validFiles = fileList.filter(file => validateFile(file));

            if (validFiles.length !== fileList.length) {
                console.warn(`${fileList.length - validFiles.length} files were excluded due to validation`);
            }

            if (validFiles.length > 0) {
                console.log(`Adding ${validFiles.length} valid files to state`);
                setFiles(prev => [...prev, ...validFiles]);
            }
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    // Ensure files can be read as base64 (testing FileReader compatibility)
    const testFileReadability = async (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            try {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(true);
                };
                reader.onerror = () => {
                    console.error(`File ${file.name} cannot be read with FileReader`);
                    resolve(false);
                };
                // Just read a small slice to test
                const smallSlice = file.slice(0, Math.min(1024, file.size));
                reader.readAsDataURL(smallSlice);
            } catch (error) {
                console.error(`Error testing file readability: ${error}`);
                resolve(false);
            }
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        // Validate form fields
        if (!formData.title || !formData.description || !formData.class_id || !formData.due_date) {
            setError('Please fill out all required fields');
            setIsSubmitting(false);
            return;
        }

        try {
            // First, create the assignment without files
            console.log('Creating assignment (no files):', formData.title);
            const assignmentData: AssignmentFormData = {
                ...formData as AssignmentFormData,
                files: [] // No files in the initial request
            };

            // Create the assignment
            const result = await createAssignment(assignmentData);
            console.log('Assignment created:', result);

            // Now, upload files if any
            if (files.length > 0) {
                const assignmentId = result.id;
                const uploadErrors = [];
                let uploadedCount = 0;

                for (const file of files) {
                    try {
                        // Use FormData for the file upload
                        const fileFormData = new FormData();
                        fileFormData.append('assignmentId', assignmentId);
                        fileFormData.append('file', file);

                        // Upload the file using fetch
                        const uploadResponse = await fetch('/api/assignment-files', {
                            method: 'POST',
                            body: fileFormData,
                        });

                        if (!uploadResponse.ok) {
                            const errorData = await uploadResponse.json();
                            uploadErrors.push(`Error uploading ${file.name}: ${errorData.error || 'Unknown error'}`);
                            continue;
                        }

                        uploadedCount++;
                    } catch (fileError) {
                        console.error(`Error uploading file ${file.name}:`, fileError);
                        uploadErrors.push(`Error uploading ${file.name}`);
                    }
                }

                console.log(`Uploaded ${uploadedCount}/${files.length} files`);
                if (uploadErrors.length > 0) {
                    setError(`Assignment created but ${uploadErrors.length} file(s) failed to upload`);
                }
            }

            setSuccess(true);

            // Reset form
            setFormData({
                title: '',
                description: '',
                class_id: classes.length > 0 ? classes[0].id : '',
                due_date: '',
                points: 100,
                assignment_type: 'exercise'
            });
            setFiles([]);

            // Redirect after successful submission
            setTimeout(() => {
                router.push('/dashboard/assignments');
                router.refresh();
            }, 2000);
        } catch (err: any) {
            console.error('Error creating assignment:', err);

            // Extract the error message
            let errorMessage = 'Failed to create assignment. Please try again.';
            if (err) {
                if (typeof err === 'string') {
                    errorMessage = err;
                } else if (err.message) {
                    errorMessage = err.message;
                } else if (err.error && err.error.message) {
                    errorMessage = err.error.message;
                }
            }

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Enter a title for your assignment"
                    required
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="input w-full"
                    placeholder="Provide detailed instructions for the assignment"
                    required
                />
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
                    Class <span className="text-red-500">*</span>
                </label>
                <select
                    id="class_id"
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    className="input w-full"
                    required
                >
                    {classes.length === 0 ? (
                        <option value="">No classes available</option>
                    ) : (
                        classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))
                    )}
                </select>
            </div>

            {/* Assignment Type */}
            <div className="space-y-2">
                <label htmlFor="assignment_type" className="block text-sm font-medium text-gray-700">
                    Assignment Type <span className="text-red-500">*</span>
                </label>
                <select
                    id="assignment_type"
                    name="assignment_type"
                    value={formData.assignment_type}
                    onChange={handleChange}
                    className="input w-full"
                    required
                >
                    <option value="exercise">Exercise</option>
                    <option value="essay">Essay</option>
                    <option value="quiz">Quiz</option>
                    <option value="recording">Recording</option>
                    <option value="other">Other</option>
                </select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                    Due Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        id="due_date"
                        name="due_date"
                        type="datetime-local"
                        value={formData.due_date}
                        onChange={handleChange}
                        className="input w-full"
                        required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Points */}
            <div className="space-y-2">
                <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                    Points <span className="text-red-500">*</span>
                </label>
                <input
                    id="points"
                    name="points"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.points}
                    onChange={handleChange}
                    className="input w-full"
                    required
                />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Attachment Files (Optional)
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
                        multiple
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                        Click to upload or drag and drop files here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        PDF, Word, Excel, PowerPoint, Audio, and Video files accepted
                    </p>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Files to Attach ({files.length})
                    </label>
                    <div className="space-y-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                                <div className="flex items-center">
                                    <File className="w-4 h-4 text-gray-400 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-start">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Assignment created successfully! Redirecting...</p>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-outline mr-2"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <div className="flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            <span className="text-white">
                                Create Assignment
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </form>
    )
} 