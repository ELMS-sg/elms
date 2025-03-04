"use client"

import Image from "next/image"

interface AvatarProps {
    url?: string | null
    name?: string | null
    size?: "sm" | "md" | "lg"
    className?: string
}

const sizeMap = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-32 h-32 text-2xl"
}

export function Avatar({ url, name = "User", size = "md", className = "" }: AvatarProps) {
    const sizeClasses = sizeMap[size]
    const initials = (name || "U")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className={`relative rounded-full overflow-hidden bg-primary-100 flex items-center justify-center ${sizeClasses} ${className}`}>
            {url ? (
                <Image
                    src={url}
                    alt={`${name}'s avatar`}
                    fill
                    className="object-cover"
                    sizes={size === "lg" ? "128px" : size === "md" ? "48px" : "32px"}
                    priority={size === "lg"}
                    unoptimized
                />
            ) : (
                <span className="font-medium text-primary-600">
                    {initials}
                </span>
            )}
        </div>
    )
} 