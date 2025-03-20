'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { uploadMaterial } from '@/lib/material-actions'

interface Props {
    classId: string
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function UploadMaterialDialog({ classId, onSuccess, trigger }: Props) {
    const [open, setOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState<File | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            setFile(file)
            if (!name) {
                // Use file name without extension as default name
                setName(file.name.replace(/\.[^/.]+$/, ""))
            }
        }
    }, [name])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1,
        multiple: false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !name) return

        try {
            setUploading(true)

            toast({
                title: "Uploading...",
                description: "Please wait while we upload your material"
            });

            const result = await uploadMaterial(classId, file, name, description);

            toast({
                title: "Success",
                description: "Material uploaded successfully"
            });

            // Close dialog
            setOpen(false)

            // Reset form
            setFile(null)
            setName('')
            setDescription('')

            if (onSuccess) {
                onSuccess()
            } else {
                // Force page refresh
                window.location.reload()
            }
        } catch (error) {
            console.error('Upload failed:', error)

            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Material
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Course Material</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                            isDragActive ? "border-primary bg-white" : "border-gray-200 hover:border-primary/50",
                            file && "border-green-500 bg-green-50"
                        )}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex items-center justify-center gap-2">
                                <FileText className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setFile(null)
                                    }}
                                    className="p-1 hover:bg-green-100 rounded-full"
                                >
                                    <X className="h-4 w-4 text-green-600" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                <div className="text-sm">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                </div>
                                <p className="text-xs text-gray-500">PDF or Word documents (max 10MB)</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Material Name
                        </label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter a name for this material"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">
                            Description (Optional)
                        </label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!file || !name || uploading}
                            className='bg-blue-500 text-white'
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 