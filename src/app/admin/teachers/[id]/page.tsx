'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Calendar,
    BookOpen,
    ArrowLeft,
    Pencil,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassCard } from '@/components/classes/ClassCard';

type Teacher = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url?: string;
    created_at: string;
};

type Class = {
    id: string;
    name: string;
    description: string;
    teacher: string;
    teacherId: string;
    startDate: string;
    endDate: string;
    image: string;
    level: string;
    learningMethod: string;
    location: string;
    totalStudents: number;
    tags: string[];
    schedule?: string;
};

export default function TeacherDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTeacherAndClasses = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch teacher details
                const teacherResponse = await fetch(`/api/users/${params.id}`);
                if (!teacherResponse.ok) {
                    throw new Error('Failed to fetch teacher details');
                }
                const teacherData = await teacherResponse.json();
                setTeacher(teacherData);

                // Fetch classes for this teacher using the dedicated endpoint
                const classesResponse = await fetch(`/api/teachers/${params.id}/classes`);
                if (!classesResponse.ok) {
                    throw new Error('Failed to fetch classes');
                }
                const teacherClasses = await classesResponse.json();
                setClasses(teacherClasses);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTeacherAndClasses();
    }, [params.id]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading teacher details...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
                    <p className="font-bold">Teacher Not Found</p>
                    <p>The teacher you are looking for does not exist or has been removed.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex items-center"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-8">
            {/* Header with navigation */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="flex items-center mb-4 md:mb-0">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="mr-4 bg-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
                        <p className="text-gray-500">Teacher Details</p>
                    </div>
                </div>
                <Link href={`/admin/users/edit/${teacher.id}`}>
                    <Button className="bg-primary text-white hover:bg-primary/90">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Teacher
                    </Button>
                </Link>
            </div>

            {/* Teacher profile and classes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Teacher profile card */}
                <Card className="bg-white shadow-sm">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-2xl">Teacher Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                                {teacher.avatar_url ? (
                                    <img
                                        src={teacher.avatar_url}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="h-16 w-16 text-gray-400" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-center">{teacher.name}</h2>
                            <Badge className="mt-2 bg-blue-500 hover:bg-blue-600">TEACHER</Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-gray-700">{teacher.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Joined</p>
                                    <p className="text-gray-700">{formatDate(teacher.created_at)}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <BookOpen className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Classes</p>
                                    <p className="text-gray-700">{classes.length} active classes</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Classes taught by this teacher */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">Classes Taught</h2>

                    {classes.length === 0 ? (
                        <Card className="bg-white shadow-sm">
                            <CardContent className="p-8 text-center">
                                <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
                                <p className="text-gray-500 mb-6">This teacher is not currently assigned to any classes.</p>
                                <Link href="/admin/classes/create">
                                    <Button className="bg-primary text-white hover:bg-primary/90">
                                        Assign to a New Class
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.map((cls) => (
                                <ClassCard
                                    key={cls.id}
                                    id={cls.id}
                                    name={cls.name}
                                    description={cls.description}
                                    image={cls.image || '/images/class-placeholder.jpg'}
                                    teacherName={cls.teacher}
                                    learningMethod={cls.learningMethod}
                                    schedule={cls.schedule}
                                    enrolledCount={cls.totalStudents}
                                    maxStudents={30}
                                    isAdmin={true}
                                    onDelete={(id) => {
                                        // This would be implemented to handle class deletion
                                        console.log(`Delete class ${id} requested`);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 