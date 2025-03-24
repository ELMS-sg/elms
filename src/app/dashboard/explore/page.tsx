import { Metadata } from "next"
import Image from "next/image"
import { requireServerAuth } from "@/lib/actions"
import { getAvailableClasses, requestEnrollment, enrollInClass } from "@/lib/class-actions"
import {
    Search,
    Filter,
    Calendar,
    Users,
    GraduationCap,
    Globe,
    MapPin,
} from "lucide-react"

export const metadata: Metadata = {
    title: "Explore Classes | English Learning Center",
    description: "Explore and enroll in available English classes",
}

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
    const user = await requireServerAuth()

    // Only students can access this page
    if (user.role !== 'STUDENT') {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">Only students can explore and enroll in classes.</p>
                </div>
            </div>
        )
    }

    // Get available classes
    const availableClasses = await getAvailableClasses()

    // Generate categories based on the actual classes
    const allClassesCount = availableClasses.length

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Explore English Classes
                </h1>
                <p className="text-gray-600">
                    Browse and enroll in available IELTS and TOEIC preparation courses
                </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary-100 text-primary-700">
                        All Classes
                        <span className="ml-1 text-xs rounded-full px-2 py-0.5 bg-white text-gray-500">
                            {allClassesCount}
                        </span>
                    </button>
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
                {availableClasses.length > 0 ? (
                    availableClasses.map((classItem) => (
                        <div
                            key={classItem.id}
                            className="bg-white rounded-lg shadow-card overflow-hidden"
                        >
                            <div className="relative h-48 w-full">
                                <Image
                                    src={classItem.image || '/images/default-class.jpg'}
                                    alt={classItem.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-5">
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
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{classItem.currentStudents} / {classItem.maxStudents} students</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-4">
                                {classItem.hasPendingRequest ? (
                                    <div className="text-amber-600 text-sm text-center">
                                        Enrollment request pending
                                    </div>
                                ) : classItem.hasCapacity ? (
                                    <form action={async () => {
                                        'use server'
                                        await enrollInClass(classItem.id)
                                    }}>
                                        <button className="btn btn-primary w-full">
                                            Enroll Now
                                        </button>
                                    </form>
                                ) : (
                                    <form action={async (formData: FormData) => {
                                        'use server'
                                        const message = formData.get('message') as string
                                        await requestEnrollment(classItem.id, message)
                                    }}>
                                        <input
                                            type="text"
                                            name="message"
                                            placeholder="Why do you want to join this class?"
                                            className="input input-sm w-full mb-2"
                                            required
                                        />
                                        <button className="btn btn-secondary w-full">
                                            Request Enrollment
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 py-12 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Available</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            There are currently no classes available for enrollment. Please check back later.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
} 