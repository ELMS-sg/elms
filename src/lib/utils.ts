import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or class name objects into a single string
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind CSS conflicts
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a date string consistently across server and client
 * Using UTC to avoid timezone issues
 */
export function formatDate(date: string | Date): string {
    const d = new Date(date)
    // Format as YYYY-MM-DD for consistent parsing
    return d.toISOString().split('T')[0]
}

export function formatDisplayDate(date: string | Date): string {
    const d = new Date(date)
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function formatTime(date: Date | string) {
    // Ensure we have a Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Add logging to debug timezone issues
    console.log("Formatting time for date:", dateObj);
    console.log("Local ISO string:", dateObj.toLocaleString());

    // Use the date's local time instead of UTC
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');

    const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
    console.log("Formatted time:", formattedTime);
    return formattedTime;
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

/**
 * Generate recurring meeting dates for a class schedule
 * @param startDate The start date of the class
 * @param endDate The end date of the class
 * @param daysOfWeek Array of days (0 = Sunday, 1 = Monday, etc.)
 * @param timeString Time in 24-hour format (e.g., "20:00" for 8 PM)
 */
export function generateRecurringMeetings(
    startDate: Date,
    endDate: Date,
    daysOfWeek: number[],
    timeString: string
): Date[] {
    const meetings: Date[] = [];
    const [hours, minutes] = timeString.split(':').map(Number);
    const currentDate = new Date(startDate);

    // Set time for the start date
    currentDate.setHours(hours, minutes, 0, 0);

    while (currentDate <= endDate) {
        if (daysOfWeek.includes(currentDate.getDay())) {
            meetings.push(new Date(currentDate));
        }
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("GENERATE RECURRING MEETINGS", meetings)

    return meetings;
}

/**
 * Format meeting duration from start and end time
 */
export function formatMeetingDuration(startTime: string, endTime: string): string {
    const start = new Date(`1970-01-01T${startTime}Z`);
    const end = new Date(`1970-01-01T${endTime}Z`);
    const durationMs = end.getTime() - start.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    if (durationMinutes < 60) {
        return `${durationMinutes} minutes`;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours} hours`;
}

/**
 * Parse schedule string into days and times
 * @param schedule Format: "Days, Start Time - End Time" (e.g., "Mondays and Wednesdays, 6:00 PM - 8:00 PM")
 */
export function parseSchedule(schedule: string): {
    days: number[];
    startTime: string;
    endTime: string;
    duration: number;
} {
    const [daysStr, timeStr] = schedule.split(', ')

    // Parse days
    const dayMap: { [key: string]: number } = {
        'sunday': 0, 'sundays': 0,
        'monday': 1, 'mondays': 1,
        'tuesday': 2, 'tuesdays': 2,
        'wednesday': 3, 'wednesdays': 3,
        'thursday': 4, 'thursdays': 4,
        'friday': 5, 'fridays': 5,
        'saturday': 6, 'saturdays': 6
    }

    const days = daysStr.toLowerCase()
        .replace(' and ', ' ')
        .split(' ')
        .filter(day => dayMap[day] !== undefined)
        .map(day => dayMap[day])

    // Parse times
    const [startStr, endStr] = timeStr.split(' - ')

    // Convert to 24-hour format
    const convertTo24Hour = (timeStr: string) => {
        const [time, meridiem] = timeStr.split(' ')
        const [hours, minutes] = time.split(':').map(Number)

        if (meridiem === 'PM' && hours !== 12) {
            return `${hours + 12}:${minutes.toString().padStart(2, '0')}`
        } else if (meridiem === 'AM' && hours === 12) {
            return `00:${minutes.toString().padStart(2, '0')}`
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    const startTime = convertTo24Hour(startStr)
    const endTime = convertTo24Hour(endStr)

    // Calculate duration in minutes
    const start = new Date(`1970-01-01T${startTime}:00Z`)
    const end = new Date(`1970-01-01T${endTime}:00Z`)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)

    return {
        days,
        startTime,
        endTime,
        duration
    }
} 