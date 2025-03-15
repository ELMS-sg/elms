import { parseSchedule } from './utils'

/**
 * Generate all class dates based on schedule
 */
export function generateClassDates(schedule: string, startDate: string, endDate: string): string[] {
    const { days } = parseSchedule(schedule)
    const dates: string[] = []
    const currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate <= end) {
        if (days.includes(currentDate.getDay())) {
            dates.push(currentDate.toISOString().split('T')[0])
        }
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
}

/**
 * Check if today is a class day and return today's date if it is
 */
export function getTodayClassDate(schedule: string, startDate: string, endDate: string): string | null {
    console.log('getTodayClassDate input:', { schedule, startDate, endDate })

    const { days } = parseSchedule(schedule)
    console.log('Parsed schedule days:', days)

    // Create dates without time components for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)

    // Format today's date as YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0]

    // For debugging
    console.log({
        schedule,
        today: today.toISOString(),
        start: start.toISOString(),
        end: end.toISOString(),
        isWithinRange: today >= start && today <= end,
        isClassDay: days.includes(today.getDay()),
        days,
        dayOfWeek: today.getDay(),
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()]
    })

    // Check if today is within the class date range and is a class day
    if (today >= start && today <= end && days.includes(today.getDay())) {
        return todayStr
    }

    return null
} 