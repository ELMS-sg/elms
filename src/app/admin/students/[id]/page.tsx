'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, BookOpen, GraduationCap, ArrowLeft, Pencil, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassCard } from '@/components/classes/ClassCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Student = {
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

export default function StudentDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [student, setStudent] = useState<Student | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRemovingClass, setIsRemovingClass] = useState(false);
    const [classToRemove, setClassToRemove] = useState<Class | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

    // Extract ID from params safely
    const studentId = params?.id;

    useEffect(() => {
        if (!studentId) {
            setError("No student ID provided");
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                // Fetch student data from our new API
                const studentResponse = await fetch(`/api/students/profile?id=${studentId}`);
                if (studentResponse.ok) {
                    const studentData = await studentResponse.json();
                    setStudent(studentData);
                } else {
                    console.error('Student fetch failed:', studentResponse.statusText);
                    // Create a basic student object as fallback
                    setStudent({
                        id: studentId,
                        name: `Student ${studentId.substring(0, 8)}`,
                        email: "Not available",
                        role: "STUDENT",
                        created_at: new Date().toISOString(),
                    });
                }

                // Fetch classes data 
                const classesResponse = await fetch(`/api/students/${studentId}/classes`);
                if (classesResponse.ok) {
                    const classesData = await classesResponse.json();
                    setClasses(classesData);
                } else {
                    console.error('Classes fetch failed:', classesResponse.statusText);
                    setClasses([]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [studentId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleRemoveClick = (classItem: Class) => {
        setClassToRemove(classItem);
        setIsRemoveDialogOpen(true);
    };

    const handleRemoveConfirm = async () => {
        if (!classToRemove || !student) return;

        setIsRemovingClass(true);
        try {
            const response = await fetch(`/api/classes/${classToRemove.id}/unenroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: student.id
                })
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    router.push('/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove student from class');
            }

            setClasses(classes.filter(cls => cls.id !== classToRemove.id));
            setIsRemoveDialogOpen(false);
            setClassToRemove(null);
            alert('Student removed from class successfully');
        } catch (err) {
            console.error('Error removing student from class:', err);
            alert(`Failed to remove student from class: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsRemovingClass(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading student details...</span>
            </div>
        );
    }

    if (error && !student) {
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

    if (!student) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
                    <p className="font-bold">Student Not Found</p>
                    <p>The student you are looking for does not exist or has been removed.</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                        <p className="text-gray-500">Student Details</p>
                    </div>
                </div>
                <Link href={`/admin/users/edit/${student.id}`}>
                    <Button className="bg-primary text-white hover:bg-primary/90">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Student
                    </Button>
                </Link>
            </div>

            {/* Student profile and classes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Student profile card */}
                <Card className="bg-white shadow-sm">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-2xl">Student Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                                {student.avatar_url ? (
                                    <img
                                        src={student.avatar_url}
                                        alt={student.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="h-16 w-16 text-gray-400" />
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-center">{student.name}</h2>
                            <Badge className="mt-2 bg-green-500 hover:bg-green-600">STUDENT</Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Mail className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-gray-700">{student.email || "Not available"}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Calendar className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Joined</p>
                                    <p className="text-gray-700">{student.created_at ? formatDate(student.created_at) : "Not available"}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <BookOpen className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Enrolled Classes</p>
                                    <p className="text-gray-700">{classes.length} classes</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Classes enrolled by this student */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">Enrolled Classes</h2>

                    {classes.length === 0 ? (
                        <Card className="bg-white shadow-sm">
                            <CardContent className="p-8 text-center">
                                <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
                                <p className="text-gray-500 mb-6">This student is not currently enrolled in any classes.</p>
                                <Link href="/admin/classes">
                                    <Button className="bg-primary text-white hover:bg-primary/90">
                                        Browse Available Classes
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
                                    onDelete={() => handleRemoveClick(cls)}
                                    mode="student"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Remove Class Confirmation Dialog */}
            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Remove from Class</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove {student.name} from the class "{classToRemove?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsRemoveDialogOpen(false)}
                            disabled={isRemovingClass}
                            className="sm:w-auto bg-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleRemoveConfirm}
                            disabled={isRemovingClass}
                            className="sm:w-auto border-red-400 border text-red-600 hover:text-red-700 hover:border-red-500"
                        >
                            {isRemovingClass ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                'Remove Student'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 