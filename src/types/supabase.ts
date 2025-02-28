export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string
                    password: string
                    role: 'STUDENT' | 'TEACHER' | 'ADMIN'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name: string
                    password: string
                    role: 'STUDENT' | 'TEACHER' | 'ADMIN'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    password?: string
                    role?: 'STUDENT' | 'TEACHER' | 'ADMIN'
                    created_at?: string
                    updated_at?: string
                }
            }
            classes: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    teacher_id: string
                    start_date: string
                    end_date: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    teacher_id: string
                    start_date: string
                    end_date: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    teacher_id?: string
                    start_date?: string
                    end_date?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            assignments: {
                Row: {
                    id: string
                    title: string
                    description: string
                    class_id: string
                    teacher_id: string
                    due_date: string
                    points: number
                    assignment_type: 'essay' | 'exercise' | 'quiz' | 'recording' | 'other'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    class_id: string
                    teacher_id: string
                    due_date: string
                    points: number
                    assignment_type: 'essay' | 'exercise' | 'quiz' | 'recording' | 'other'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    class_id?: string
                    teacher_id?: string
                    due_date?: string
                    points?: number
                    assignment_type?: 'essay' | 'exercise' | 'quiz' | 'recording' | 'other'
                    created_at?: string
                    updated_at?: string
                }
            }
            assignment_files: {
                Row: {
                    id: string
                    assignment_id: string
                    file_name: string
                    file_size: number
                    file_type: string
                    file_url: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    assignment_id: string
                    file_name: string
                    file_size: number
                    file_type: string
                    file_url: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    assignment_id?: string
                    file_name?: string
                    file_size?: number
                    file_type?: string
                    file_url?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            submissions: {
                Row: {
                    id: string
                    assignment_id: string
                    student_id: string
                    submitted_at: string
                    grade: number | null
                    feedback: string | null
                    status: 'draft' | 'submitted' | 'graded'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    assignment_id: string
                    student_id: string
                    submitted_at?: string
                    grade?: number | null
                    feedback?: string | null
                    status?: 'draft' | 'submitted' | 'graded'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    assignment_id?: string
                    student_id?: string
                    submitted_at?: string
                    grade?: number | null
                    feedback?: string | null
                    status?: 'draft' | 'submitted' | 'graded'
                    created_at?: string
                    updated_at?: string
                }
            }
            submission_files: {
                Row: {
                    id: string
                    submission_id: string
                    file_name: string
                    file_size: number
                    file_type: string
                    file_url: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    submission_id: string
                    file_name: string
                    file_size: number
                    file_type: string
                    file_url: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    submission_id?: string
                    file_name?: string
                    file_size?: number
                    file_type?: string
                    file_url?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            user_notification_preferences: {
                Row: {
                    id: string
                    user_id: string
                    email_assignments: boolean
                    email_announcements: boolean
                    email_messages: boolean
                    email_reminders: boolean
                    push_assignments: boolean
                    push_announcements: boolean
                    push_messages: boolean
                    push_reminders: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    email_assignments?: boolean
                    email_announcements?: boolean
                    email_messages?: boolean
                    email_reminders?: boolean
                    push_assignments?: boolean
                    push_announcements?: boolean
                    push_messages?: boolean
                    push_reminders?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    email_assignments?: boolean
                    email_announcements?: boolean
                    email_messages?: boolean
                    email_reminders?: boolean
                    push_assignments?: boolean
                    push_announcements?: boolean
                    push_messages?: boolean
                    push_reminders?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            // Add other table types as needed
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'STUDENT' | 'TEACHER' | 'ADMIN'
            assignment_type: 'essay' | 'exercise' | 'quiz' | 'recording' | 'other'
            submission_status: 'draft' | 'submitted' | 'graded'
        }
    }
}
