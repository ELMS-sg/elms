import { Database } from './supabase'

// Base types from database
export type AssignmentRow = Database['public']['Tables']['assignments']['Row']
export type SubmissionRow = Database['public']['Tables']['assignment_submissions']['Row']
export type AssignmentFileRow = Database['public']['Tables']['assignment_files']['Row']
export type SubmissionFileRow = Database['public']['Tables']['submission_files']['Row']

// Assignment type with related data
export type Assignment = AssignmentRow & {
    teacher?: {
        id: string
        name: string
        email: string
        avatar?: string
    }
    course?: {
        id: string
        name: string
    }
    files?: AssignmentFileRow[]
}

// Submission type with related data
export type Submission = SubmissionRow & {
    student?: {
        id: string
        name: string
        email: string
        avatar?: string
    }
    files?: SubmissionFileRow[]
}

// Assignment with submission data
export type AssignmentWithSubmission = Assignment & {
    submission?: Submission
}

// Assignment status derived from submission status and due date
export type AssignmentStatus = 'pending' | 'submitted' | 'completed' | 'late' | 'overdue'

// Frontend representation of an assignment
export type AssignmentWithStatus = AssignmentWithSubmission & {
    status: AssignmentStatus
    isLate?: boolean
    daysRemaining?: number
}

// Assignment creation form data
export type AssignmentFormData = {
    title: string
    description: string
    class_id: string
    due_date: string
    points: number
    assignment_type?: 'essay' | 'exercise' | 'quiz' | 'recording' | 'other'
    files?: File[]
}

// Submission form data
export type SubmissionFormData = {
    assignment_id: string
    files?: File[]
    notes?: string
    content?: string
}

// Grading form data
export type GradingFormData = {
    submission_id: string
    grade: number
    feedback: string
} 