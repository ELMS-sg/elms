'use client'

import Image from "next/image"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { getClassById } from "@/lib/class-actions"
import { requireServerAuth } from "@/lib/actions"
import { getClassAttendance } from "@/lib/attendance-actions"
import { generateClassDates, getTodayClassDate } from "@/lib/date-utils"
import { formatDisplayDate, formatBytes } from "@/lib/utils"
import { getClassMaterials } from "@/lib/material-actions"
import { useTransition, useEffect, useState, use } from 'react'
import {
    markAttendanceAction,
    updateContactGroupAction
} from "@/lib/server-actions"
import {
    Calendar,
    Users,
    GraduationCap,
    ArrowLeft,
    MapPin,
    Globe,
    FileText,
    MessageSquare,
    Video,
    Edit2,
    Upload,
    Download,
    Trash2,
    File
} from "lucide-react"
import { Avatar } from "@/components/Avatar"
import { AttendanceSelect } from "@/components/AttendanceSelect"
import { UploadMaterialDialog } from "@/components/UploadMaterialDialog"

type Props = {
    params: Promise<{ id: string }>
}

// Add type for class data
type ClassData = {
    id: string;
    name: string;
    description: string;
    teacher: string;
    teacherId: any;
    teacherTitle: string;
    teacherImage: string;
    startDate: string;
    endDate: string;
    image: string;
    meetingUrl?: string | null;
    contactGroup?: string | null;
    level: string;
    schedule: string;
    learningMethod: string;
    location: string;
    totalStudents: number;
    maxStudents: number;
    tags: string[];
    syllabus: string[];
    materials: string[];
    students: Array<{
        id: string;
        name: string;
        avatar: string | null;
    }>;
}

export const dynamic = 'force-dynamic'

async function fetchPageData(id: string) {
    const [user, classData, attendanceRecords, materials] = await Promise.all([
        requireServerAuth(),
        getClassById(id),
        getClassAttendance(id),
        getClassMaterials(id)
    ])

    if (!classData) {
        return null
    }

    return {
        user,
        classData,
        attendanceRecords,
        materials
    }
}

export default function ClassDetailPage({ params }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [pageData, setPageData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const resolvedParams = use(params)


    useEffect(() => {
        const loadData = async () => {
            const data = await fetchPageData(resolvedParams.id)
            if (!data) {
                notFound()
            }
            setPageData(data)
            setLoading(false)
        }
        loadData()
    }, [resolvedParams.id])

    if (loading) {
        return <div>Loading...</div>
    }

    const { user, classData, attendanceRecords, materials } = pageData
    const isTeacher = user.role === 'TEACHER' && user.id === (classData.teacherId as any).id

    // Create a map of attendance records for quick lookup
    const attendanceMap = attendanceRecords.reduce((acc: any, record: any) => {
        const key = `${record.student_id}-${record.date}`
        acc[key] = record.status
        return acc
    }, {})

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
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">{classData.name}</h1>
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
                    {/* Tags */}
                    {classData.tags && classData.tags.length > 0 && (
                        <div className="bg-white rounded-lg shadow-card p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {classData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-700 ring-1 ring-primary-600/20"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {classData.description && (
                        <div className="bg-white rounded-lg shadow-card p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{classData.description}</p>
                        </div>
                    )}

                    {/* Course Materials */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Course Materials</h2>
                            {isTeacher && (
                                <UploadMaterialDialog
                                    classId={resolvedParams.id}
                                    onSuccess={() => {
                                        window.location.reload();
                                    }}
                                />
                            )}
                        </div>
                        <div className="space-y-4">
                            {materials.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No materials available yet
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {materials.map((material) => (
                                        <div
                                            key={material.id}
                                            className="py-4 flex items-center justify-between"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-gray-100 rounded">
                                                    <File className="h-6 w-6 text-primary-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {material.name}
                                                    </h3>
                                                    {material.description && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {material.description}
                                                        </p>
                                                    )}
                                                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                        <span>
                                                            {formatBytes(material.file_size)}
                                                        </span>
                                                        <span>
                                                            {new Date(material.uploaded_at).toLocaleDateString()}
                                                        </span>
                                                        <span>
                                                            Uploaded by {(material.uploaded_by as any).name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={material.downloadUrl}
                                                    download
                                                    className="btn btn-sm btn-ghost"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Students */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Students</h2>
                            <span className="text-sm text-gray-500">{classData.totalStudents} / {classData.maxStudents}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {classData.students.map((student) => (
                                <div key={student.id} className="flex md:items-center flex-col md:flex-row gap-4 md:gap-0 justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
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
                                    {isTeacher && (
                                        <div className="flex flex-col gap-3">
                                            {(() => {
                                                const todayClassDate = getTodayClassDate(
                                                    classData.schedule,
                                                    classData.startDate,
                                                    classData.endDate
                                                )

                                                if (!todayClassDate) {
                                                    return (
                                                        <div className="text-sm text-gray-500 italic">
                                                            No class scheduled for today
                                                        </div>
                                                    )
                                                }

                                                const todayAttendance = attendanceMap[`${student.id}-${todayClassDate}`] || 'present'

                                                return (
                                                    <div className="flex flex-wrap items-center gap-6">
                                                        <AttendanceSelect
                                                            defaultValue={todayAttendance}
                                                            onSubmit={async (status) => {
                                                                await markAttendanceAction(classData.id, student.id, todayClassDate, status)
                                                            }}
                                                        />
                                                        <div className="flex-1 min-w-[200px]">
                                                            <div className="text-xs text-gray-500 mb-2">Previous Attendance:</div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {generateClassDates(classData.schedule, classData.startDate, classData.endDate)
                                                                    .filter(date => {
                                                                        const todayClassDate = getTodayClassDate(
                                                                            classData.schedule,
                                                                            classData.startDate,
                                                                            classData.endDate
                                                                        )
                                                                        return date < (todayClassDate || '')
                                                                    })
                                                                    .map((date) => {
                                                                        const status = attendanceMap[`${student.id}-${date}`] || 'present'
                                                                        if (!status) return null
                                                                        return (
                                                                            <div
                                                                                key={date}
                                                                                className={`
                                                                                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                                                                                    ${status === 'present'
                                                                                        ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                                                                                        : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                                                                                    }
                                                                                `}
                                                                            >
                                                                                <span className={`w-1.5 h-1.5 rounded-full ${status === 'present' ? 'bg-green-600' : 'bg-red-600'}`} />
                                                                                {formatDisplayDate(date)}
                                                                            </div>
                                                                        )
                                                                    })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </div>
                                    )}
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
                                {isTeacher ? (
                                    <form action={async (formData: FormData) => {
                                        const contactGroup = formData.get('contactGroup') as string
                                        await updateContactGroupAction(classData.id, contactGroup)
                                    }}>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="url"
                                                name="contactGroup"
                                                defaultValue={classData.contactGroup || ''}
                                                placeholder="Enter group chat URL"
                                                className="input input-sm flex-1"
                                            />
                                            <button type="submit" className="btn btn-sm btn-primary">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </form>
                                ) : classData.contactGroup ? (
                                    <a
                                        href={classData.contactGroup}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div className="btn btn-sm btn-outline w-full flex items-center justify-center">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            <span>Contact Class Group</span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="text-sm text-gray-500 text-center p-2 bg-gray-50 rounded-lg">
                                        No contact group available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Class Details */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Class Details</h2>
                        <div className="space-y-4">
                            {classData.level && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Level</p>
                                    <p className="font-medium text-gray-900">{classData.level}</p>
                                </div>
                            )}
                            {classData.schedule && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Schedule</p>
                                    <p className="font-medium text-gray-900">{classData.schedule}</p>
                                </div>
                            )}
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
                            {classData.meetingUrl ? (
                                <a
                                    href={classData.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-accent w-full flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                                >
                                    <Video className="h-4 w-4 mr-2" />
                                    Join Class Meeting
                                </a>
                            ) : (
                                <div className="text-sm text-gray-500 text-center p-2 bg-gray-50 rounded-lg">
                                    No meeting link available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 