import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import {
    Calendar,
    Clock,
    Users,
    ArrowLeft,
    Video,
    MapPin,
    BookOpen,
    CheckCircle,
    Info
} from "lucide-react"

export const metadata: Metadata = {
    title: "Schedule Meeting | English Learning Center",
    description: "Schedule a new meeting with our IELTS and TOEIC specialists",
}

export const dynamic = 'force-dynamic'

export default async function ScheduleMeetingPage() {
    // Get authenticated user
    const user = await requireServerAuth()

    // Mock data for teachers
    const teachers = [
        {
            id: "1",
            name: "Dr. Sarah Johnson",
            image: "/images/teacher-sarah.jpg",
            title: "IELTS Examiner & Senior Instructor",
            specialties: ["IELTS Speaking", "IELTS Reading", "Academic Writing"],
            rating: 4.9,
            reviewCount: 124
        },
        {
            id: "2",
            name: "Prof. Michael Chen",
            image: "/images/teacher-michael.jpg",
            title: "TOEIC Specialist & Business English Trainer",
            specialties: ["TOEIC Listening", "Business English", "Presentation Skills"],
            rating: 4.8,
            reviewCount: 98
        },
        {
            id: "3",
            name: "Lisa Wong",
            image: "/images/teacher-lisa.jpg",
            title: "IELTS Writing & Speaking Coach",
            specialties: ["IELTS Writing", "Pronunciation", "Grammar"],
            rating: 4.7,
            reviewCount: 86
        },
        {
            id: "4",
            name: "Dr. James Wilson",
            image: "/images/teacher-james.jpg",
            title: "Grammar Specialist & TOEIC Instructor",
            specialties: ["TOEIC Grammar", "Vocabulary Building", "Test Strategies"],
            rating: 4.9,
            reviewCount: 112
        }
    ]

    // Mock data for meeting types
    const meetingTypes = [
        {
            id: "one-on-one",
            name: "One-on-One Session",
            description: "Private session with a teacher focused on your specific needs",
            icon: <Users className="w-5 h-5" />,
            duration: ["30 min", "45 min", "60 min"],
            price: ["$25", "$35", "$45"]
        },
        {
            id: "group",
            name: "Group Session",
            description: "Learn with peers in a collaborative environment (max 10 students)",
            icon: <Users className="w-5 h-5" />,
            duration: ["60 min", "90 min", "120 min"],
            price: ["$15", "$20", "$25"]
        }
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button */}
            <div className="mb-6">
                <Link
                    href="/dashboard/meetings"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Meetings
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule a Meeting</h1>
                <p className="text-gray-600">
                    Book a session with one of our IELTS or TOEIC specialists
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Step 1: Select Teacher */}
                    <div className="bg-white rounded-lg shadow-card overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 font-semibold">
                                    1
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Select a Teacher</h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {teachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className="flex flex-col md:flex-row items-start md:items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
                                        <Image
                                            src={teacher.image}
                                            alt={teacher.name}
                                            width={64}
                                            height={64}
                                            className="rounded-full"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-900">{teacher.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{teacher.title}</p>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {teacher.specialties.map((specialty, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                                >
                                                    {specialty}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= Math.floor(teacher.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600 ml-2">{teacher.rating} ({teacher.reviewCount} reviews)</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <div className="w-6 h-6 rounded-full border-2 border-primary-500"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Select Meeting Type */}
                    <div className="bg-white rounded-lg shadow-card overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 font-semibold">
                                    2
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Select Meeting Type</h2>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {meetingTypes.map((type) => (
                                <div
                                    key={type.id}
                                    className="flex flex-col p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start mb-4">
                                        <div className="p-3 rounded-md bg-primary-50 text-primary-600 mr-4">
                                            {type.icon}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                                            <p className="text-sm text-gray-500">{type.description}</p>
                                        </div>
                                        <div>
                                            <div className="w-6 h-6 rounded-full border-2 border-primary-500"></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                        {type.duration.map((duration, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 rounded-md p-3 text-center hover:border-primary-300 hover:bg-white transition-colors cursor-pointer"
                                            >
                                                <p className="text-sm font-medium text-gray-900">{duration}</p>
                                                <p className="text-xs text-gray-500">{type.price[index]}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Select Date and Time */}
                    <div className="bg-white rounded-lg shadow-card overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 font-semibold">
                                    3
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Select Date and Time</h2>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="date"
                                            className="input pl-10 w-full"
                                            placeholder="Select date"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <select className="input pl-10 w-full">
                                            <option value="">Select time</option>
                                            <option value="09:00">9:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="13:00">1:00 PM</option>
                                            <option value="14:00">2:00 PM</option>
                                            <option value="15:00">3:00 PM</option>
                                            <option value="16:00">4:00 PM</option>
                                            <option value="17:00">5:00 PM</option>
                                            <option value="18:00">6:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Format</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-md bg-primary-50 text-primary-600 mr-3">
                                                <Video className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">Online Meeting</h4>
                                                <p className="text-xs text-gray-500">Via Zoom or Google Meet</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="w-5 h-5 rounded-full border-2 border-primary-500 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-md bg-red-50 text-red-600 mr-3">
                                                <MapPin className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900">In-Person</h4>
                                                <p className="text-xs text-gray-500">At our learning center</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Related Class (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <BookOpen className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select className="input pl-10 w-full">
                                        <option value="">Select a class</option>
                                        <option value="1">IELTS Academic Preparation</option>
                                        <option value="2">TOEIC Intensive Course</option>
                                        <option value="3">IELTS Speaking & Writing</option>
                                        <option value="4">TOEIC Grammar Mastery</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Topic</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="e.g., IELTS Speaking Practice, Grammar Questions, etc."
                                />
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                                <textarea
                                    className="input w-full h-24"
                                    placeholder="Describe what you'd like to focus on during this meeting..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Summary */}
                    <div className="bg-white rounded-lg shadow-card overflow-hidden sticky top-6">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Booking Summary</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 text-primary-600 mr-2" />
                                    <span className="text-sm text-gray-700">One-on-One Session</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">$45.00</span>
                            </div>

                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 text-primary-600 mr-2" />
                                    <span className="text-sm text-gray-700">60 minutes</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <Calendar className="w-5 h-5 text-primary-600 mr-2" />
                                    <span className="text-sm text-gray-700">March 10, 2024</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <Clock className="w-5 h-5 text-primary-600 mr-2" />
                                    <span className="text-sm text-gray-700">3:00 PM</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-start">
                                <div className="flex items-center">
                                    <Video className="w-5 h-5 text-primary-600 mr-2" />
                                    <span className="text-sm text-gray-700">Online Meeting</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-700">Subtotal</span>
                                    <span className="text-sm font-medium text-gray-900">$45.00</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm text-gray-700">Tax</span>
                                    <span className="text-sm font-medium text-gray-900">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-primary-600">$45.00</span>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="btn btn-primary w-full">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirm Booking
                                </button>
                                <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-start">
                                    <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700">
                                        You can cancel or reschedule your meeting up to 24 hours before the scheduled time without any charges.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 