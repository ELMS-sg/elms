'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { submitAssignment } from '@/lib/assignment-actions'
import { Assignment } from '@/types/assignments'
import {
    Upload,
    File,
    X,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react'

interface SubmitAssignmentFormProps {
    assignment: Assignment
}

export default function SubmitAssignmentForm({ assignment }: SubmitAssignmentFormProps) {
    const router = useRouter()
    const [files, setFiles] = useState<File[]>([])
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileList = Array.from(e.target.files)
            setFiles(prev => [...prev, ...fileList])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)

        try {
            // Create form data
            const formData = {
                assignment_id: assignment.id,
                files,
                notes
            }

            // Submit the assignment
            await submitAssignment(formData)

            // Show success message
            setSuccess(true)

            // Reset form
            setFiles([])
            setNotes('')

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/dashboard/assignments')
                router.refresh()
            }, 2000)
        } catch (err) {
            console.error('Error submitting assignment:', err)
            setError('Failed to submit assignment. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Assignment Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                <p className="text-gray-600 mb-2">{assignment.description}</p>
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Points: {assignment.points}</span>
                    <span className="text-gray-500">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Upload Files
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
                        Files to Submit ({files.length})
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

            {/* Notes */}
            <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes (Optional)
                </label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="input w-full"
                    placeholder="Add any notes or comments about your submission..."
                />
            </div>

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
                    <p className="text-sm">Assignment submitted successfully! Redirecting...</p>
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
                    disabled={isSubmitting || files.length === 0}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Submit Assignment
                        </>
                    )}
                </button>
            </div>
        </form>
    )
} 