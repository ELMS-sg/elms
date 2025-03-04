"use client"

import { useState } from "react"
import Image from "next/image"
import { uploadUserAvatar, deleteUserAvatar } from "@/lib/user-actions"

interface AvatarUploadProps {
    userId: string
    currentAvatarUrl?: string
    onAvatarChange?: (url: string) => void
    className?: string
}

export function AvatarUpload({
    userId,
    currentAvatarUrl,
    onAvatarChange,
    className = ""
}: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB')
            return
        }

        try {
            setIsUploading(true)
            setError(null)

            // If there's an existing avatar, delete it
            if (currentAvatarUrl) {
                await deleteUserAvatar(userId, currentAvatarUrl)
            }

            // Upload new avatar
            const newAvatarUrl = await uploadUserAvatar(userId, file)

            // Notify parent component
            onAvatarChange?.(newAvatarUrl)
        } catch (err) {
            setError('Failed to upload avatar')
            console.error(err)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {/* Avatar Preview */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {currentAvatarUrl ? (
                    <Image
                        src={currentAvatarUrl}
                        alt="Avatar"
                        fill
                        className="object-cover"
                        sizes="128px"
                        priority
                        unoptimized // Disable Next.js image optimization for Supabase URLs
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                            className="w-12 h-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Upload Button */}
            <div className="flex flex-col items-center gap-2">
                <label
                    htmlFor="avatar-upload"
                    className={`
                        btn btn-primary
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {isUploading ? 'Uploading...' : 'Change Avatar'}
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                />
                {error && (
                    <p className="text-sm text-red-500">{error}</p>
                )}
            </div>
        </div>
    )
} 