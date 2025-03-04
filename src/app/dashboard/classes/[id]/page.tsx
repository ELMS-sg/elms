import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { requireServerAuth } from "@/lib/actions"
import { getClassById } from "@/lib/class-actions"
import {
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
} from "lucide-react"
import { Avatar } from "@/components/Avatar"

type Props = {
    params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = await Promise.resolve(params.id)
    const classData = await getClassById(id)

    if (!classData) {
        return {
            title: "Class Not Found | English Learning Center",
            description: "The requested class could not be found",
        }
    }

    return {
        title: `${classData.name} | English Learning Center`,
        description: classData.description || "",
    }
}

export const dynamic = 'force-dynamic'

export default async function ClassDetailPage({ params }: Props) {
    // Get the authenticated user
    const user = await requireServerAuth()

    // Resolve the ID parameter
    const id = await Promise.resolve(params.id)

    // Get class data from the database
    const classData = await getClassById(id)

    // If class not found, show 404 page
    if (!classData) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link
                    href="/dashboard/classes"
                    className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
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
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-6 text-white">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {classData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="badge badge-primary text-xs"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">{classData.name}</h1>
                            <p className="text-white/80 mb-4 max-w-3xl">{classData.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-1" />
                                    <span>{classData.teacher}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{classData.startDate} - {classData.endDate}</span>
                                </div>
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{classData.totalStudents} / {classData.maxStudents} students</span>
                                </div>
                                <div className="flex items-center">
                                    {classData.learningMethod === "Online" ? (
                                        <>
                                            <Globe className="h-4 w-4 mr-1" />
                                            <span>Online Class</span>
                                        </>
                                    ) : classData.learningMethod === "Offline" ? (
                                        <>
                                            <MapPin className="h-4 w-4 mr-1" />
                                            <span>{classData.location}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Globe className="h-4 w-4 mr-1" />
                                            <span>Hybrid - {classData.location}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Students</h2>
                            <span className="text-sm text-gray-500">{classData.totalStudents} / {classData.maxStudents}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classData.students.map((student) => (
                                <div key={student.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 flex-shrink-0">
                                        {student.avatar ? (
                                            <Image
                                                src={student.avatar}
                                                alt={student.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <span className="font-medium text-sm">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-500">Student</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Teacher Info */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Instructor</h2>
                        <div className="flex items-start">
                            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-4 flex-shrink-0">
                                {classData.teacherImage ? (
                                    <Avatar
                                        url={classData.teacherImage}
                                        name={classData.teacher}
                                        size="md"
                                    />
                                ) : (
                                    <span className="font-medium text-lg">
                                        {classData.teacher.split(' ').map(n => n[0]).join('')}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{classData.teacher}</h3>
                                <p className="text-sm text-gray-600 mb-3">{classData.teacherTitle}</p>
                                <button className="btn btn-sm btn-outline w-full">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Contact Instructor
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Class Details */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Details</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Level</p>
                                <p className="font-medium text-gray-900">{classData.level}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Schedule</p>
                                <p className="font-medium text-gray-900">{classData.schedule}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Learning Method</p>
                                <p className="font-medium text-gray-900">{classData.learningMethod}</p>
                            </div>
                            {classData.location && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Location</p>
                                    <p className="font-medium text-gray-900">{classData.location}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Duration</p>
                                <p className="font-medium text-gray-900">
                                    {classData.startDate} - {classData.endDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Resources</h2>
                        <div className="space-y-3">
                            <Link
                                href={`/dashboard/assignments?class=${classData.id}`}
                                className="btn btn-primary w-full flex items-center justify-center"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                View Assignments
                            </Link>
                            <Link
                                href={`/dashboard/meetings?class=${classData.id}`}
                                className="btn btn-outline w-full flex items-center justify-center"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Schedule Meetings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 