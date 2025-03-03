import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or class name objects into a single string
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind CSS conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function formatTime(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).format(date);
}

export function isTeacher(role: string) {
    return role === "TEACHER";
}

export function isStudent(role: string) {
    return role === "STUDENT";
}

export function isAdmin(role: string) {
    return role === "ADMIN";
} 