import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { requireServerAuth } from "@/lib/actions"
import { getStudentClasses, getTeacherClasses, requestEnrollment, handleEnrollmentRequest, getEnrollmentRequests } from "@/lib/class-actions"
import {
    BookOpen,
    Search,
    Clock,
    Calendar,
    Users,
    GraduationCap,
    ChevronRight,
    MapPin,
    Globe,
    Plus,
    BarChart
} from "lucide-react"
import { Database } from "@/types/supabase"
import { ClassSearch } from "@/components/ClassSearch.jsx"

type EnrollmentRequest = {
    id: string;
    message: string | null;
    status: Database['public']['Tables']['enrollment_requests']['Row']['status'];
    requested_at: string;
    responded_at: string | null;
    response_message: string | null;
    student_id: Database['public']['Tables']['users']['Row'];
    class_id: Pick<Database['public']['Tables']['classes']['Row'], 'id' | 'name'>;
}

export const metadata: Metadata = {
    title: "My Classes | English Learning Center",
    description: "View and manage your enrolled English classes",
}

export const dynamic = 'force-dynamic'

export default async function ClassesPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined }
}) {
    // Get the authenticated user
    const user = await requireServerAuth()
    const isTeacher = user.role === 'TEACHER'

    // Get search query from URL params
    const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : '';

    // Get classes based on user role
    let enrolledClasses = []
    if (user.role === 'STUDENT') {
        enrolledClasses = await getStudentClasses()
    } else if (user.role === 'TEACHER') {
        enrolledClasses = await getTeacherClasses()
    }

    // Filter classes - only search by class name for simplicity
    const filteredClasses = searchQuery
        ? enrolledClasses.filter(classItem =>
            classItem.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : enrolledClasses;

    // Get enrollment requests if user is a teacher
    const enrollmentRequests = isTeacher ? (await getEnrollmentRequests() as unknown as EnrollmentRequest[]) : []

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isTeacher ? "My Teaching Classes" : "My English Classes"}
                </h1>
                <p className="text-gray-600">
                    {isTeacher
                        ? "Manage your teaching classes and student enrollments"
                        : "Manage and track your enrolled IELTS and TOEIC preparation courses"}
                </p>
            </div>

            {/* Teacher-specific Quick Actions */}
            {isTeacher && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Link href="/dashboard/classes/manage-students" className="bg-white rounded-lg shadow-card p-4 flex items-center hover:shadow-card-hover transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-amber-50 text-amber-600 mr-3">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Manage Students</h3>
                            <p className="text-sm text-gray-500">View and manage enrollments</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/classes/analytics" className="bg-white rounded-lg shadow-card p-4 flex items-center hover:shadow-card-hover transition-shadow duration-300">
                        <div className="p-3 rounded-full bg-green-50 text-green-600 mr-3">
                            <BarChart className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">Class Analytics</h3>
                            <p className="text-sm text-gray-500">View performance data</p>
                        </div>
                    </Link>
                </div>
            )}

            {/* Real-time Search Bar */}
            <ClassSearch defaultValue={searchQuery} />

            {/* Enrollment Requests Section for Teachers */}
            {isTeacher && enrollmentRequests.length > 0 && (
                <div className="mb-12 bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Enrollment Requests</h2>
                    <div className="space-y-4">
                        {enrollmentRequests.map((request) => (
                            <div key={request.id} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0">
                                            {request.student_id.avatar_url ? (
                                                <Image
                                                    src={request.student_id.avatar_url}
                                                    alt={request.student_id.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            ) : (
                                                <span className="font-medium text-sm">
                                                    {request.student_id.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{request.student_id.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Requested to join {request.class_id.name}
                                            </p>
                                            {request.message && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    "{request.message}"
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(request.requested_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={async () => {
                                            'use server'
                                            await handleEnrollmentRequest(request.id, 'approve')
                                        }}>
                                            <button className="btn btn-sm btn-primary">
                                                Approve
                                            </button>
                                        </form>
                                        <form action={async (formData: FormData) => {
                                            'use server'
                                            const reason = formData.get('reason') as string
                                            await handleEnrollmentRequest(request.id, 'reject', reason)
                                        }}>
                                            <input
                                                type="text"
                                                name="reason"
                                                placeholder="Reason for rejection"
                                                className="input input-sm mr-2"
                                                required
                                            />
                                            <button className="btn btn-sm btn-error">
                                                Reject
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((classItem) => (
                        <Link
                            href={`/dashboard/classes/${classItem.id}`}
                            key={classItem.id}
                            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
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
                            <div className="p-5 flex-grow flex flex-col">
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

                                <div className="mt-auto space-y-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <GraduationCap className="h-4 w-4 mr-1" />
                                        <span>{classItem.teacher}</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        <span>{classItem.startDate} - {classItem.endDate}</span>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-500">
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
                            </div>
                            <div className="bg-white px-5 py-3 flex justify-between items-center mt-auto">
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? `No classes matching "${searchQuery}"` : "No Classes Found"}
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            {searchQuery
                                ? "Try a different search term or check out all available classes."
                                : user.role === 'STUDENT'
                                    ? "You are not enrolled in any classes yet. Explore our course catalog to find classes that interest you."
                                    : "You are not teaching any classes yet. Contact an administrator to set up your teaching schedule."
                            }
                        </p>
                        {user.role === 'STUDENT' && (
                            <Link href="/dashboard/explore" className="btn btn-primary">
                                Explore Courses
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Explore More Classes - Only for students */}
            {user.role === 'STUDENT' && filteredClasses.length > 0 && (
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

            {/* Teacher-specific Analytics Section */}
            {isTeacher && filteredClasses.length > 0 && (
                <div className="mt-12 bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Teaching Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                                <Users className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {filteredClasses.reduce((total, cls) => total + cls.totalStudents, 0)}
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Teaching Hours</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredClasses.length * 24}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                <BarChart className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Average Attendance</p>
                                <p className="text-2xl font-bold text-gray-900">92%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 