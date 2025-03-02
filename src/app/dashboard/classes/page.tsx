import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import { getStudentClasses, getTeacherClasses } from "@/lib/class-actions"
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
    // Get the authenticated user
    const user = await requireServerAuth()

    // Get classes based on user role
    let enrolledClasses = []
    if (user.role === 'STUDENT') {
        enrolledClasses = await getStudentClasses()
    } else if (user.role === 'TEACHER') {
        enrolledClasses = await getTeacherClasses()
    }

    // Generate categories based on the actual classes
    const allClassesCount = enrolledClasses.length

    // Count classes by tag
    const tagCounts = {}
    enrolledClasses.forEach(classItem => {
        classItem.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
    })

    // Count classes by learning method
    const methodCounts = {}
    enrolledClasses.forEach(classItem => {
        methodCounts[classItem.learningMethod] = (methodCounts[classItem.learningMethod] || 0) + 1
    })

    // Create categories array
    const categories = [
        { name: "All Classes", count: allClassesCount, active: true },
        ...Object.keys(tagCounts).map(tag => ({
            name: tag,
            count: tagCounts[tag],
            active: false
        })),
        ...Object.keys(methodCounts).map(method => ({
            name: method,
            count: methodCounts[method],
            active: false
        }))
    ]

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My English Classes</h1>
                <p className="text-gray-600">
                    {user.role === 'STUDENT'
                        ? "Manage and track your enrolled IELTS and TOEIC preparation courses"
                        : "Manage your teaching classes and student enrollments"}
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
                {enrolledClasses.length > 0 ? (
                    enrolledClasses.map((classItem) => (
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
                    ))
                ) : (
                    <div className="col-span-3 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Found</h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            {user.role === 'STUDENT'
                                ? "You are not enrolled in any classes yet. Explore our course catalog to find classes that interest you."
                                : "You are not teaching any classes yet. Contact an administrator to set up your teaching schedule."}
                        </p>
                        {user.role === 'STUDENT' && (
                            <Link href="/dashboard/explore" className="btn btn-primary">
                                Explore Courses
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Explore More Classes */}
            {user.role === 'STUDENT' && enrolledClasses.length > 0 && (
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
            )}

            {/* Stats Section */}
            {enrolledClasses.length > 0 && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-card p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-primary-50 text-primary-600 mr-4">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    {user.role === 'STUDENT' ? 'Enrolled Classes' : 'Teaching Classes'}
                                </p>
                                <p className="text-xl font-semibold text-gray-900">{enrolledClasses.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-card p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-green-50 text-green-600 mr-4">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Hours of Learning</p>
                                <p className="text-xl font-semibold text-gray-900">{enrolledClasses.length * 24}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-card p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-blue-50 text-blue-600 mr-4">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Upcoming Classes</p>
                                <p className="text-xl font-semibold text-gray-900">{Math.ceil(enrolledClasses.length / 2)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-card p-5">
                        <div className="flex items-center">
                            <div className="p-3 rounded-md bg-purple-50 text-purple-600 mr-4">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    {user.role === 'STUDENT' ? 'Fellow Students' : 'Total Students'}
                                </p>
                                <p className="text-xl font-semibold text-gray-900">
                                    {enrolledClasses.reduce((total, cls) => total + cls.totalStudents, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 