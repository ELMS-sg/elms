import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import {
    BookOpen,
    Search,
    Filter,
    Clock,
    Calendar,
    Users,
    GraduationCap,
    ChevronRight,
    MapPin,
    Globe
} from "lucide-react"

export const metadata: Metadata = {
    title: "My Classes | English Learning Center",
    description: "View and manage your enrolled English classes",
}

export const dynamic = 'force-dynamic'

export default async function ClassesPage() {
    // Remove unused user variable if not needed
    // const user = await requireServerAuth()

    // Mock data for enrolled classes
    const enrolledClasses = [
        {
            id: "1",
            name: "IELTS Academic Preparation",
            description: "Comprehensive preparation for the IELTS Academic test with focus on all four skills.",
            teacher: "Dr. Sarah Johnson",
            level: "Intermediate (B1-B2)",
            startDate: "September 5, 2023",
            endDate: "December 15, 2023",
            learningMethod: "Hybrid",
            location: "Main Campus, Room 204",
            totalStudents: 18,
            image: "/images/ielts-academic.jpg",
            tags: ["IELTS", "Academic"],
        },
        {
            id: "2",
            name: "TOEIC Intensive Course",
            description: "Fast-track your TOEIC score improvement with our intensive training program.",
            teacher: "Prof. Michael Chen",
            level: "Upper-Intermediate (B2)",
            startDate: "October 10, 2023",
            endDate: "November 30, 2023",
            learningMethod: "Online",
            location: null,
            totalStudents: 24,
            image: "/images/toeic-intensive.jpg",
            tags: ["TOEIC", "Business English"],
        },
        {
            id: "3",
            name: "IELTS Speaking & Writing",
            description: "Specialized course focusing on the speaking and writing modules of the IELTS test.",
            teacher: "Lisa Wong",
            level: "Advanced (C1)",
            startDate: "September 15, 2023",
            endDate: "November 15, 2023",
            learningMethod: "Offline",
            location: "Downtown Branch, Room 105",
            totalStudents: 12,
            image: "/images/ielts-speaking.jpg",
            tags: ["IELTS", "Speaking", "Writing"],
        },
        {
            id: "4",
            name: "TOEIC Grammar Mastery",
            description: "Master the grammar concepts essential for achieving a high score on the TOEIC test.",
            teacher: "Dr. James Wilson",
            level: "Beginner to Intermediate (A2-B1)",
            startDate: "September 20, 2023",
            endDate: "December 5, 2023",
            learningMethod: "Hybrid",
            location: "Main Campus, Room 108",
            totalStudents: 20,
            image: "/images/toeic-grammar.jpg",
            tags: ["TOEIC", "Grammar"],
        },
    ]

    // Mock data for available class categories
    const categories = [
        { name: "All Classes", count: enrolledClasses.length, active: true },
        { name: "IELTS", count: 2, active: false },
        { name: "TOEIC", count: 2, active: false },
        { name: "Online", count: 1, active: false },
        { name: "Offline", count: 3, active: false },
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My English Classes</h1>
                <p className="text-gray-600">
                    Manage and track your enrolled IELTS and TOEIC preparation courses
                </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${category.active
                                ? "bg-primary-100 text-primary-700"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {category.name}
                            <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-white text-gray-500">
                                {category.count}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="flex w-full md:w-auto gap-2">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="input pl-10 w-full"
                            placeholder="Search classes..."
                        />
                    </div>
                    <button className="btn btn-outline flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledClasses.map((classItem) => (
                    <Link
                        href={`/dashboard/classes/${classItem.id}`}
                        key={classItem.id}
                        className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300"
                    >
                        <div className="relative h-48 w-full">
                            <Image
                                src={classItem.image}
                                alt={classItem.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-white rounded-md px-2 py-1 flex items-center shadow-sm">
                                <span className="text-sm font-medium">{classItem.level}</span>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {classItem.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="badge badge-primary text-xs"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                                {classItem.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {classItem.description}
                            </p>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <GraduationCap className="h-4 w-4 mr-1" />
                                <span>{classItem.teacher}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{classItem.startDate} - {classItem.endDate}</span>
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                {classItem.learningMethod === "Online" ? (
                                    <>
                                        <Globe className="h-4 w-4 mr-1 text-primary-600" />
                                        <span>Online Class</span>
                                    </>
                                ) : classItem.learningMethod === "Offline" ? (
                                    <>
                                        <MapPin className="h-4 w-4 mr-1 text-accent-red" />
                                        <span>{classItem.location}</span>
                                    </>
                                ) : (
                                    <>
                                        <Globe className="h-4 w-4 mr-1 text-accent-green" />
                                        <span>Hybrid - {classItem.location}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                            <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{classItem.totalStudents} students</span>
                            </div>
                            <div className="text-primary-600 flex items-center text-sm font-medium">
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Explore More Classes */}
            <div className="mt-12 bg-white rounded-lg shadow-card p-6 text-center">
                <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-600 mb-4">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Discover More English Courses</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                        Explore our catalog of IELTS and TOEIC preparation courses taught by expert instructors to improve your English proficiency.
                    </p>
                </div>
                <Link href="/dashboard/explore" className="btn btn-primary inline-flex items-center">
                    Explore Course Catalog
                    <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
            </div>

            {/* Stats Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-primary-50 text-primary-600 mr-4">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Enrolled Classes</p>
                            <p className="text-xl font-semibold text-gray-900">{enrolledClasses.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-green-50 text-green-600 mr-4">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">IELTS Courses</p>
                            <p className="text-xl font-semibold text-gray-900">2</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-yellow-50 text-yellow-600 mr-4">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">TOEIC Courses</p>
                            <p className="text-xl font-semibold text-gray-900">2</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-card p-5">
                    <div className="flex items-center">
                        <div className="p-3 rounded-md bg-red-50 text-red-600 mr-4">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Teachers</p>
                            <p className="text-xl font-semibold text-gray-900">4</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 