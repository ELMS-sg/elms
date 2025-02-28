import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireServerAuth } from "@/lib/actions"
import {
    BookOpen,
    Calendar,
    Clock,
    Users,
    GraduationCap,
    ArrowLeft,
    MapPin,
    Globe,
    FileText,
    MessageSquare,
    CheckCircle,
    ChevronRight
} from "lucide-react"

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    // In a real app, fetch the class data from an API or database
    const classData = getClassData(params.id)

    if (!classData) {
        return {
            title: "Class Not Found | English Learning Center",
            description: "The requested class could not be found",
        }
    }

    return {
        title: `${classData.name} | English Learning Center`,
        description: classData.description,
    }
}

export const dynamic = 'force-dynamic'

// Mock function to get class data
function getClassData(id: string) {
    const classes = [
        {
            id: "1",
            name: "IELTS Academic Preparation",
            description: "Comprehensive preparation for the IELTS Academic test with focus on all four skills.",
            teacher: "Dr. Sarah Johnson",
            teacherTitle: "IELTS Examiner & Senior Instructor",
            teacherImage: "/images/teacher-sarah.jpg",
            level: "Intermediate (B1-B2)",
            startDate: "September 5, 2023",
            endDate: "December 15, 2023",
            schedule: "Tuesdays and Thursdays, 6:00 PM - 8:00 PM",
            learningMethod: "Hybrid",
            location: "Main Campus, Room 204",
            totalStudents: 18,
            maxStudents: 20,
            image: "/images/ielts-academic.jpg",
            tags: ["IELTS", "Academic"],
            syllabus: [
                "Week 1-2: Introduction to IELTS & Listening Skills",
                "Week 3-4: Reading Strategies & Practice",
                "Week 5-6: Writing Task 1 - Charts and Graphs",
                "Week 7-8: Writing Task 2 - Essays",
                "Week 9-10: Speaking Parts 1-3",
                "Week 11-12: Mock Tests & Final Review"
            ],
            materials: [
                "Official IELTS Practice Materials",
                "Cambridge IELTS 15-17",
                "Custom Vocabulary Workbook",
                "Online Practice Tests"
            ],
            students: [
                { id: "s1", name: "Alex Johnson", avatar: "/images/avatar1.jpg" },
                { id: "s2", name: "Maria Garcia", avatar: "/images/avatar2.jpg" },
                { id: "s3", name: "David Kim", avatar: "/images/avatar3.jpg" },
                { id: "s4", name: "Sarah Chen", avatar: "/images/avatar4.jpg" },
                { id: "s5", name: "James Wilson", avatar: "/images/avatar5.jpg" },
                { id: "s6", name: "Emma Davis", avatar: null },
                { id: "s7", name: "Michael Brown", avatar: null },
                { id: "s8", name: "Sophia Martinez", avatar: null },
                // More students...
            ]
        },
        {
            id: "2",
            name: "TOEIC Intensive Course",
            description: "Fast-track your TOEIC score improvement with our intensive training program.",
            teacher: "Prof. Michael Chen",
            teacherTitle: "TOEIC Specialist & Business English Trainer",
            teacherImage: "/images/teacher-michael.jpg",
            level: "Upper-Intermediate (B2)",
            startDate: "October 10, 2023",
            endDate: "November 30, 2023",
            schedule: "Mondays, Wednesdays, and Fridays, 5:30 PM - 7:30 PM",
            learningMethod: "Online",
            location: null,
            totalStudents: 24,
            maxStudents: 30,
            image: "/images/toeic-intensive.jpg",
            tags: ["TOEIC", "Business English"],
            syllabus: [
                "Week 1: TOEIC Test Structure & Strategies",
                "Week 2: Listening Comprehension - Part 1-2",
                "Week 3: Listening Comprehension - Part 3-4",
                "Week 4: Reading - Grammar & Vocabulary",
                "Week 5: Reading - Text Completion & Reading Comprehension",
                "Week 6: Full Practice Tests & Final Review"
            ],
            materials: [
                "ETS Official TOEIC Preparation Guide",
                "Business Vocabulary in Use",
                "Online Practice Platform Access",
                "Custom Grammar Worksheets"
            ],
            students: [
                { id: "s10", name: "Thomas Lee", avatar: "/images/avatar6.jpg" },
                { id: "s11", name: "Jennifer Wong", avatar: "/images/avatar7.jpg" },
                { id: "s12", name: "Robert Park", avatar: "/images/avatar8.jpg" },
                { id: "s13", name: "Lisa Tanaka", avatar: null },
                { id: "s14", name: "Daniel Smith", avatar: null },
                // More students...
            ]
        },
        {
            id: "3",
            name: "IELTS Speaking & Writing",
            description: "Specialized course focusing on the speaking and writing modules of the IELTS test.",
            teacher: "Lisa Wong",
            teacherTitle: "IELTS Writing & Speaking Coach",
            teacherImage: "/images/teacher-lisa.jpg",
            level: "Advanced (C1)",
            startDate: "September 15, 2023",
            endDate: "November 15, 2023",
            schedule: "Saturdays, 10:00 AM - 1:00 PM",
            learningMethod: "Offline",
            location: "Downtown Branch, Room 105",
            totalStudents: 12,
            maxStudents: 15,
            image: "/images/ielts-speaking.jpg",
            tags: ["IELTS", "Speaking", "Writing"],
            syllabus: [
                "Week 1: Speaking Part 1 - Personal Questions",
                "Week 2: Speaking Part 2 - Cue Card Topics",
                "Week 3: Speaking Part 3 - Discussion",
                "Week 4: Writing Task 1 - Data & Process",
                "Week 5: Writing Task 2 - Opinion Essays",
                "Week 6: Writing Task 2 - Argument Essays",
                "Week 7: Writing Task 2 - Problem & Solution",
                "Week 8: Final Assessment & Feedback"
            ],
            materials: [
                "IELTS Speaking Success",
                "IELTS Writing Task 1 & 2 Guide",
                "Topic Vocabulary Cards",
                "Model Answers Collection"
            ],
            students: [
                { id: "s20", name: "Emily Johnson", avatar: "/images/avatar9.jpg" },
                { id: "s21", name: "Ryan Zhang", avatar: "/images/avatar10.jpg" },
                { id: "s22", name: "Olivia Williams", avatar: null },
                { id: "s23", name: "Nathan Chen", avatar: null },
                // More students...
            ]
        },
        {
            id: "4",
            name: "TOEIC Grammar Mastery",
            description: "Master the grammar concepts essential for achieving a high score on the TOEIC test.",
            teacher: "Dr. James Wilson",
            teacherTitle: "Grammar Specialist & TOEIC Instructor",
            teacherImage: "/images/teacher-james.jpg",
            level: "Beginner to Intermediate (A2-B1)",
            startDate: "September 20, 2023",
            endDate: "December 5, 2023",
            schedule: "Wednesdays, 6:00 PM - 8:30 PM",
            learningMethod: "Hybrid",
            location: "Main Campus, Room 108",
            totalStudents: 20,
            maxStudents: 25,
            image: "/images/toeic-grammar.jpg",
            tags: ["TOEIC", "Grammar"],
            syllabus: [
                "Week 1: Verb Tenses Overview",
                "Week 2: Modal Verbs & Conditionals",
                "Week 3: Passive Voice & Reported Speech",
                "Week 4: Prepositions & Phrasal Verbs",
                "Week 5: Articles & Determiners",
                "Week 6: Conjunctions & Linking Words",
                "Week 7: Common TOEIC Grammar Traps",
                "Week 8: Grammar in Context - TOEIC Practice",
                "Week 9: Final Assessment & Review"
            ],
            materials: [
                "Essential Grammar for TOEIC",
                "Grammar Practice Workbook",
                "TOEIC Grammar Flashcards",
                "Online Grammar Exercises"
            ],
            students: [
                { id: "s30", name: "Kevin Park", avatar: "/images/avatar11.jpg" },
                { id: "s31", name: "Michelle Lee", avatar: "/images/avatar12.jpg" },
                { id: "s32", name: "Brandon Kim", avatar: null },
                { id: "s33", name: "Jessica Tan", avatar: null },
                // More students...
            ]
        },
    ]

    return classes.find(c => c.id === id)
}

export default async function ClassDetailPage({ params }: { params: { id: string } }) {
    // Get class data
    const classData = getClassData(params.id)

    // If class not found, show 404
    if (!classData) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back button */}
            <div className="mb-6">
                <Link
                    href="/dashboard/classes"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Classes
                </Link>
            </div>

            {/* Class Header */}
            <div className="bg-white rounded-lg shadow-card overflow-hidden mb-8">
                <div className="relative h-64 w-full">
                    <Image
                        src={classData.image}
                        alt={classData.name}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {classData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="badge bg-white/20 backdrop-blur-sm text-white text-xs"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {classData.name}
                        </h1>
                        <p className="text-white/80 max-w-2xl">
                            {classData.description}
                        </p>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-primary-50 text-primary-600 mr-4">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Teacher</p>
                                <p className="font-medium text-gray-900">{classData.teacher}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-green-50 text-green-600 mr-4">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Level</p>
                                <p className="font-medium text-gray-900">{classData.level}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-yellow-50 text-yellow-600 mr-4">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Students</p>
                                <p className="font-medium text-gray-900">{classData.totalStudents} / {classData.maxStudents}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-primary-50 text-primary-600 mr-4">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">{classData.startDate} - {classData.endDate}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-red-50 text-red-600 mr-4">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Schedule</p>
                            <p className="font-medium text-gray-900">{classData.schedule}</p>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {classData.learningMethod === "Online" ? (
                            <>
                                <div className="p-3 rounded-md bg-blue-50 text-blue-600 mr-4">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Learning Method</p>
                                    <p className="font-medium text-gray-900">Online Class</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="p-3 rounded-md bg-purple-50 text-purple-600 mr-4">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p className="font-medium text-gray-900">
                                        {classData.learningMethod === "Hybrid" ? "Hybrid - " : ""}
                                        {classData.location}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Class Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Syllabus */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Syllabus</h2>
                        <ul className="space-y-3">
                            {classData.syllabus.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Materials */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Materials</h2>
                        <ul className="space-y-3">
                            {classData.materials.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <FileText className="w-5 h-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Students */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Students</h2>
                            <span className="text-sm text-gray-500">{classData.totalStudents} / {classData.maxStudents}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {classData.students.slice(0, 8).map((student) => (
                                <div key={student.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    {student.avatar ? (
                                        <Image
                                            src={student.avatar}
                                            alt={student.name}
                                            width={36}
                                            height={36}
                                            className="rounded-full mr-3"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3">
                                            {student.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="text-gray-700 font-medium">{student.name}</span>
                                </div>
                            ))}

                            {classData.totalStudents > 8 && (
                                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors">
                                    <Link href="#" className="flex items-center">
                                        View all students
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Teacher Info */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Teacher</h2>
                        <div className="flex flex-col items-center text-center mb-4">
                            <div className="relative w-24 h-24 mb-3">
                                <Image
                                    src={classData.teacherImage}
                                    alt={classData.teacher}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{classData.teacher}</h3>
                            <p className="text-sm text-gray-500">{classData.teacherTitle}</p>
                        </div>
                        <div className="flex justify-center">
                            <Link href="#" className="btn btn-outline w-full">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact Teacher
                            </Link>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Actions</h2>
                        <div className="space-y-3">
                            <Link href="#" className="btn btn-primary w-full flex items-center justify-center">
                                <FileText className="w-4 h-4 mr-2" />
                                View Assignments
                            </Link>
                            <Link href="#" className="btn btn-outline w-full flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Class Discussion
                            </Link>
                            <Link href="#" className="btn btn-outline w-full flex items-center justify-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Class Schedule
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 