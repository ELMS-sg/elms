"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { StudentsList } from "@/components/StudentsList"

export default function CreateMeetingPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [classes, setClasses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [showStudentField, setShowStudentField] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        classId: "",
        meetingType: "",
        studentId: "",
        title: "",
        date: "",
        time: "",
        duration: "1 hour",
        meetingLink: "",
        meetingId: "",
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

        // Special handling for meeting type
        if (name === 'meetingType') {
            setShowStudentField(value === 'ONE_ON_ONE')
            if (value !== 'ONE_ON_ONE') {
                setFormData(prev => ({ ...prev, studentId: "" }))
            }
        }
    }

    // Handle radio button changes
    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        if (name === 'meetingType') {
            setShowStudentField(value === 'ONE_ON_ONE')
            if (value !== 'ONE_ON_ONE') {
                setFormData(prev => ({ ...prev, studentId: "" }))
            }
        }
    }

    // Handle student selection
    const handleStudentSelect = (studentId: string) => {
        setFormData(prev => ({
            ...prev,
            studentId
        }))
    }

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError("")
        setSubmitting(true)

        try {
            // Validate form data
            if (formData.meetingType === 'ONE_ON_ONE' && !formData.studentId) {
                throw new Error('Please select a student for one-on-one meeting')
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
                <h1 className="text-2xl font-bold text-gray-900">Create New Meeting</h1>
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

                    {/* Meeting Type */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Meeting Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="meetingType"
                                    value="ONE_ON_ONE"
                                    checked={formData.meetingType === "ONE_ON_ONE"}
                                    onChange={handleRadioChange}
                                    className="form-radio text-primary-600"
                                    required
                                />
                                <span className="ml-2">One-on-One</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="meetingType"
                                    value="GROUP"
                                    checked={formData.meetingType === "GROUP"}
                                    onChange={handleRadioChange}
                                    className="form-radio text-primary-600"
                                />
                                <span className="ml-2">Group</span>
                            </label>
                        </div>
                    </div>

                    {/* Student Selection - Only show for one-on-one meetings */}
                    {showStudentField && formData.classId && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Student <span className="text-red-500">*</span>
                            </label>
                            <div className="border rounded-md p-3 bg-gray-50">
                                <StudentsList
                                    classId={formData.classId}
                                    onSelectStudent={handleStudentSelect}
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

                    {/* Zoom Meeting Link */}
                    <div className="space-y-2">
                        <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                            Zoom Meeting Link <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            id="meetingLink"
                            name="meetingLink"
                            value={formData.meetingLink}
                            onChange={handleInputChange}
                            required
                            className="input w-full"
                            placeholder="https://zoom.us/j/..."
                        />
                    </div>

                    {/* Zoom Meeting ID */}
                    <div className="space-y-2">
                        <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700">
                            Zoom Meeting ID
                        </label>
                        <input
                            type="text"
                            id="meetingId"
                            name="meetingId"
                            value={formData.meetingId}
                            onChange={handleInputChange}
                            className="input w-full"
                            placeholder="123 456 7890"
                        />
                        <p className="text-xs text-gray-500">Optional: Enter the meeting ID for easier reference</p>
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