export type MeetingType = "ONE_ON_ONE" | "GROUP"
export type MeetingStatus = "open" | "confirmed" | "cancelled" | "completed"

export interface Teacher {
    name: string
    avatar_url: string
    title: string
}

export interface RelatedClass {
    id: string
    name: string
}

export interface Meeting {
    id: string
    title: string
    description?: string
    teacher: Teacher
    type: MeetingType
    startTime: string
    endTime: string
    duration: string
    isOnline: boolean
    meetingLink?: string
    location?: string
    status: MeetingStatus
    relatedClass: RelatedClass | null
    participants?: number
    maxParticipants?: number
}

export interface CalendarMeeting {
    id: string
    title: string
    time: string
    isOnline: boolean
    type: MeetingType
    day: number
    teacher: Teacher
} 
