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
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
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
        setError(null)
        setSuccess(null)
        setIsSubmitting(true)

        try {
            console.log("Creating submission formData without files")
            // Create form data without files
            const formData = new FormData()
            formData.append('assignment_id', assignment.id)
            formData.append('content', content)
            if (notes) {
                formData.append('notes', notes)
            }

            console.log("Submitting assignment")
            // Submit the assignment
            const response = await fetch('/api/assignments/submit', {
                method: 'POST',
                body: formData,
            })

            // Get the response text first
            const responseText = await response.text()
            let data

            // Try to parse it as JSON, but don't throw if it fails
            try {
                data = JSON.parse(responseText)
            } catch (parseError) {
                console.error("Could not parse response as JSON:", responseText.substring(0, 200) + "...")
                throw new Error(
                    response.ok
                        ? "Received unexpected response from server"
                        : `Server error (${response.status}): The API endpoint may be missing or misconfigured`
                )
            }

            // Now check if the response was successful
            if (!response.ok) {
                console.error("Assignment submission failed, status:", response.status, data)
                throw new Error(data.error || 'Failed to submit assignment')
            }

            console.log("Assignment submission successful, submissionId:", data.id)

            let successfulUploads = 0
            let failedUploads = 0
            const uploadErrors = []

            // Upload files if any
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i]
                    console.log(`Preparing to upload file ${i + 1}/${files.length}: ${file.name} (${file.size} bytes)`)

                    try {
                        const fileFormData = new FormData()
                        fileFormData.append('submissionId', data.id)
                        fileFormData.append('file', file)

                        console.log(`Sending upload request for ${file.name}`)
                        const uploadResponse = await fetch('/api/submission-files', {
                            method: 'POST',
                            body: fileFormData,
                        })

                        const uploadText = await uploadResponse.text()
                        console.log(`Upload response for ${file.name}:`, uploadText)

                        let uploadData
                        try {
                            uploadData = JSON.parse(uploadText)
                        } catch (e) {
                            console.error("Could not parse upload response as JSON:", e)
                            throw new Error(`Upload response is not valid JSON: ${uploadText}`)
                        }

                        if (!uploadResponse.ok) {
                            console.error(`File upload failed for ${file.name}:`, uploadData)
                            failedUploads++
                            uploadErrors.push(uploadData.error || 'Unknown upload error')
                        } else {
                            console.log(`File upload successful for ${file.name}, URL:`, uploadData.fileUrl)
                            successfulUploads++
                        }
                    } catch (uploadError) {
                        console.error(`Exception during file upload for ${file.name}:`, uploadError)
                        failedUploads++
                        uploadErrors.push(uploadError instanceof Error ? uploadError.message : 'Unknown upload error')
                    }
                }
            }

            let message = `Assignment submitted successfully!`
            if (files.length > 0) {
                message += ` ${successfulUploads} file(s) uploaded.`
                if (failedUploads > 0) {
                    message += ` ${failedUploads} file(s) failed to upload. Errors: ${uploadErrors.join('; ')}`
                }
            }

            setSuccess(message)

            // Reset form after a delay
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } catch (err) {
            console.error('Error in handleSubmit:', err)
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
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

            {/* Content */}
            <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Assignment Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="input w-full"
                    placeholder="Type or paste your assignment content here..."
                />
            </div>

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
                    <p className="text-sm">{success}</p>
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
                    disabled={isSubmitting || (!content && files.length === 0)}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <div className="flex items-center justify-center">
                            <Upload className="w-4 h-4 mr-2" />
                            <span>
                                Submit Assignment
                            </span>
                        </div>
                    )}
                </button>
            </div>
        </form>
    )
} 