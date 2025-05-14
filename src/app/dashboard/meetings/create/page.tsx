"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Video, ExternalLink, Plus } from "lucide-react"
import { StudentsList } from "@/components/StudentsList"

export default function CreateMeetingPage() {
    const [user, setUser] = useState<any>(null)
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [showMeetingOptions, setShowMeetingOptions] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        classId: "",
        meetingType: "ONE_ON_ONE",
        studentId: "",
        title: "",
        date: "",
        time: "",
        duration: "1 hour",
        meetingLink: "",
        notes: ""
    })

    // Fetch user and classes data on component mount
    useEffect(() => {
        async function fetchInitialData() {
            try {
                // Fetch user data
                const userResponse = await fetch('/api/auth/me')
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const userData = await userResponse.json()
                setUser(userData)

                // If not a teacher, don't fetch classes
                if (userData.role !== 'TEACHER') {
                    setLoading(false)
                    return
                }

                // Fetch classes data
                const classesResponse = await fetch('/api/classes/teacher')
                if (!classesResponse.ok) {
                    throw new Error('Failed to fetch classes')
                }
                const classesData = await classesResponse.json()
                setClasses(classesData)
            } catch (error) {
                console.error('Error fetching initial data:', error)
                setError('Failed to load required data. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()
    }, [])

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle student selection
    const handleStudentSelect = (studentId: string) => {
        setFormData(prev => ({
            ...prev,
            studentId
        }))
    }

    // Handle creating a new meeting on external platforms
    const createExternalMeeting = (platform: 'zoom' | 'google') => {
        let url = '';
        if (platform === 'zoom') {
            url = 'https://zoom.us/meeting/schedule';
        } else if (platform === 'google') {
            url = 'https://meet.google.com/new';
        }

        // Open the platform in a new tab
        window.open(url, '_blank');
        setShowMeetingOptions(false);
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)

        try {
            // Validate form data
            if (!formData.studentId) {
                throw new Error('Please select a student for the meeting')
            }

            console.log("Submitting meeting data:", formData)

            // Submit form data
            const response = await fetch('/api/meetings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            console.log("Response from server:", data)

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create meeting')
            }

            // Show success message
            alert("Meeting created successfully!")

            // Redirect on success - force a hard navigation to ensure page refresh
            window.location.href = '/dashboard/meetings'
        } catch (error: any) {
            console.error('Error creating meeting:', error)
            setError(error.message || 'Failed to create meeting. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // If loading, show loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </div>
        )
    }

    if (user && user.role !== 'TEACHER') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p>Only teachers can create meetings.</p>
                </div>
                <Link href="/dashboard/meetings" className="btn btn-outline flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Meetings
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center">
                <Link href="/dashboard/meetings" className="mr-4">
                    <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New One-on-One Meeting</h1>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6 mb-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Class Selection */}
                    <div className="space-y-2">
                        <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                            Class <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="classId"
                            name="classId"
                            value={formData.classId}
                            onChange={handleInputChange}
                            required
                            className="input w-full"
                        >
                            <option value="">Select a class</option>
                            {classes.map((classItem) => (
                                <option key={classItem.id} value={classItem.id}>
                                    {classItem.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Hidden field for meeting type */}
                    <input
                        type="hidden"
                        name="meetingType"
                        value="ONE_ON_ONE"
                    />

                    {/* Student Selection */}
                    {formData.classId && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Student <span className="text-red-500">*</span>
                            </label>
                            <div className="border rounded-md p-3 bg-gray-50">
                                <StudentsList
                                    classId={formData.classId}
                                    onSelectStudent={handleStudentSelect}
                                    selectedStudentId={formData.studentId}
                                />
                            </div>
                            {formData.studentId && (
                                <p className="text-sm text-green-600">Student selected</p>
                            )}
                        </div>
                    )}

                    {/* Meeting Title */}
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Meeting Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="input w-full"
                            placeholder="Enter meeting title"
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="input w-full"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                                Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                id="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                className="input w-full"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                            Duration <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="duration"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                            className="input w-full"
                        >
                            <option value="30 minutes">30 minutes</option>
                            <option value="1 hour">1 hour</option>
                            <option value="1.5 hours">1.5 hours</option>
                            <option value="2 hours">2 hours</option>
                        </select>
                    </div>

                    {/* Meeting Link */}
                    <div className="space-y-2">
                        <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                            Meeting Link <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                id="meetingLink"
                                name="meetingLink"
                                value={formData.meetingLink}
                                onChange={handleInputChange}
                                required
                                className="input w-full pr-12"
                                placeholder="https://meet.google.com/... or https://zoom.us/j/..."
                            />
                            <button
                                type="button"
                                onClick={() => setShowMeetingOptions(!showMeetingOptions)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                                title="Create new meeting"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        {showMeetingOptions && (
                            <div className="mt-2 flex flex-col sm:flex-row gap-2">
                                <button
                                    type="button"
                                    onClick={() => createExternalMeeting('zoom')}
                                    className="flex items-center justify-center gap-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md border border-blue-200"
                                >
                                    <Video className="h-4 w-4" />
                                    Create Zoom Meeting
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => createExternalMeeting('google')}
                                    className="flex items-center justify-center gap-2 text-sm bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-md border border-green-200"
                                >
                                    <Video className="h-4 w-4" />
                                    Create Google Meet
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Paste your Zoom or Google Meet link here. Need to create a new meeting? Click the + icon.
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                            className="input w-full"
                            placeholder="Additional information about the meeting..."
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                        >
                            {submitting ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Creating...
                                </>
                            ) : (
                                "Create Meeting"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 