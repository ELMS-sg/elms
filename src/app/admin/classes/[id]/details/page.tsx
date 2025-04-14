'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Trash2,
    Search,
    ArrowLeft,
    Loader2,
    UserPlus,
    GraduationCap,
    UserRound,
    CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Student = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    enrolledAt: string;
    enrollmentId: string;
    joinedAt: string;
};

type ClassDetails = {
    id: string;
    name: string;
    teacherId: string;
    teacher_name: string;
};

export default function ClassStudentsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [availableStudents, setAvailableStudents] = useState<{ id: string; name: string }[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [isRemovingStudent, setIsRemovingStudent] = useState(false);

    // Fetch class details and enrolled students
    useEffect(() => {
        const fetchClassData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch class details
                const classResponse = await fetch(`/api/classes/${params.id}`);
                if (!classResponse.ok) {
                    throw new Error('Failed to fetch class details');
                }
                const classData = await classResponse.json();
                setClassDetails({
                    id: classData.id,
                    name: classData.name,
                    teacherId: classData.teacher_id,
                    teacher_name: classData.teacher_name
                });

                // Fetch enrolled students
                const studentsResponse = await fetch(`/api/classes/${params.id}/enrollments`);
                if (!studentsResponse.ok) {
                    throw new Error('Failed to fetch enrolled students');
                }
                const enrolledStudents = await studentsResponse.json();
                setStudents(enrolledStudents);
                setFilteredStudents(enrolledStudents);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchClassData();
    }, [params.id]);

    // Filter students when search query changes
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredStudents(students);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredStudents(
                students.filter(
                    student =>
                        student.name.toLowerCase().includes(query) ||
                        student.email.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, students]);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Handle removing a student
    const handleRemoveClick = (student: Student) => {
        setStudentToRemove(student);
        setIsRemoveDialogOpen(true);
    };

    const handleRemoveConfirm = async () => {
        if (!studentToRemove) return;

        setIsRemovingStudent(true);
        try {
            const response = await fetch(`/api/classes/${params.id}/unenroll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: studentToRemove.id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to remove student from class');
            }

            // Remove the student from the list
            setStudents(students.filter(s => s.id !== studentToRemove.id));
            setIsRemoveDialogOpen(false);
            setStudentToRemove(null);
            alert('Student removed from class successfully');
        } catch (err) {
            console.error('Error removing student:', err);
            alert(`Failed to remove student: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsRemovingStudent(false);
        }
    };

    // Handle opening the add student dialog
    const handleAddClick = async () => {
        // Fetch available students (all students not enrolled in this class)
        try {
            const response = await fetch('/api/students');
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const allStudents = await response.json();

            // Filter out already enrolled students
            const enrolledIds = students.map(s => s.id);
            const available = allStudents.filter(s => !enrolledIds.includes(s.id));

            setAvailableStudents(available);
            setIsAddDialogOpen(true);
        } catch (err) {
            console.error('Error fetching available students:', err);
            alert(`Failed to fetch available students: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    // Handle adding a student
    const handleAddConfirm = async () => {
        if (!selectedStudentId) {
            alert('Please select a student');
            return;
        }

        setIsAddingStudent(true);
        try {
            const response = await fetch(`/api/classes/${params.id}/enrollments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentId: selectedStudentId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add student to class');
            }

            // Refresh the student list
            const studentsResponse = await fetch(`/api/classes/${params.id}/enrollments`);
            if (!studentsResponse.ok) {
                throw new Error('Failed to fetch updated student list');
            }
            const updatedStudents = await studentsResponse.json();
            setStudents(updatedStudents);

            setIsAddDialogOpen(false);
            setSelectedStudentId('');
            alert('Student added to class successfully');
        } catch (err) {
            console.error('Error adding student:', err);
            alert(`Failed to add student: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsAddingStudent(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading class students...</span>
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

    if (!classDetails) {
        return (
            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
                    <p className="font-bold">Class Not Found</p>
                    <p>The class you are looking for does not exist or has been removed.</p>
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
        <div className="max-w-7xl h-screen mx-auto p-8 mb-auto">
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
                        <h1 className="text-3xl font-bold text-gray-900">{classDetails.name}</h1>
                        <p className="text-gray-500">Class Students Management</p>
                    </div>
                </div>
                <Button
                    className="bg-blue-400 text-white hover:bg-blue-500"
                    onClick={handleAddClick}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </div>

            {/* Class info and student search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-2 bg-white">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-xl">Class Information</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center">
                                <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                                <span className="text-gray-700">{students.length} students enrolled</span>
                            </div>
                            <div className="flex items-center">
                                <User className="h-5 w-5 mr-2 text-gray-500" />
                                <span className="text-gray-700">Teacher: {classDetails.teacher_name}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="relative">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="input pl-10 w-full"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Students list */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>Student</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Enrolled On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-gray-500">
                                        {searchQuery ? (
                                            <>
                                                <div className="flex justify-center mb-2">
                                                    <Search className="h-10 w-10 text-gray-300" />
                                                </div>
                                                <p className="font-medium">No students found matching "{searchQuery}"</p>
                                                <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex justify-center mb-2">
                                                    <UserRound className="h-10 w-10 text-gray-300" />
                                                </div>
                                                <p className="font-medium">No students enrolled in this class</p>
                                                <p className="text-sm mt-1">Add students to get started</p>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-gray-50 border-t border-gray-100">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                                                    {student.avatar ? (
                                                        <img
                                                            src={student.avatar}
                                                            alt={student.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserRound className="h-5 w-5 text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{student.email}</TableCell>
                                        <TableCell className="text-gray-600">
                                            <div className="flex items-center">
                                                <CalendarClock className="h-4 w-4 mr-1 text-gray-400" />
                                                {formatDate(student.enrolledAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 border-gray-200 hover:bg-red-50 text-red-600 bg-white"
                                                onClick={() => handleRemoveClick(student)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="ml-2 hidden sm:inline">Remove</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Student Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Student to Class</DialogTitle>
                        <DialogDescription>
                            Select a student to add to {classDetails.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            <SelectTrigger className="w-full bg-white focus:none focus:ring-0">
                                <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {availableStudents.length === 0 ? (
                                    <SelectItem value="no-students" disabled>
                                        No available students
                                    </SelectItem>
                                ) : (
                                    availableStudents.map(student => (
                                        <SelectItem key={student.id} value={student.id} className="hover:bg-blue-50">
                                            {student.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="sm:justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            disabled={isAddingStudent}
                            className="sm:w-auto bg-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddConfirm}
                            disabled={isAddingStudent || !selectedStudentId}
                            className="sm:w-auto bg-blue-400 text-white hover:bg-blue-500"
                        >
                            {isAddingStudent ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Student
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Student Dialog */}
            <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Remove Student</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove <span className="font-semibold">{studentToRemove?.name}</span> from this class?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsRemoveDialogOpen(false)}
                            disabled={isRemovingStudent}
                            className="sm:w-auto bg-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleRemoveConfirm}
                            disabled={isRemovingStudent}
                            className="sm:w-auto border border-red-400 text-red-400 hover:bg-red-400 hover:text-white bg-white"
                        >
                            {isRemovingStudent ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Student
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 