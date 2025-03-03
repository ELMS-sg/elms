'use client';

import { useStudentsByClass } from '@/hooks/useStudents';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

interface StudentsListProps {
    classId: string;
    onSelectStudent?: (studentId: string) => void;
}

export function StudentsList({ classId, onSelectStudent }: StudentsListProps) {
    const { data, isLoading, error, refetch } = useStudentsByClass(classId);

    useEffect(() => {
        if (classId) {
            console.log(`StudentsList: Loading students for class ${classId}`);
            refetch();
        }
    }, [classId, refetch]);

    // Log data when it changes
    useEffect(() => {
        if (data) {
            console.log(`StudentsList: Received data for class ${classId}:`, data);
        }
    }, [data, classId]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                <p className="text-sm text-gray-500">Loading students for class {classId}...</p>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
        );
    }

    if (error) {
        console.error('Error in StudentsList:', error);
        return (
            <div className="text-red-500 p-2 rounded bg-red-50">
                <p>Error loading students</p>
                <p className="text-xs">{error.message}</p>
                <button
                    onClick={() => refetch()}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded mt-2"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data?.students || data.students.length === 0) {
        return (
            <div className="text-gray-500">
                <p>No students found in this class.</p>
                <p className="text-xs mt-1">Class ID: {classId}</p>
                <button
                    onClick={() => refetch()}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded mt-2"
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Students in this class ({data.students.length}):</h3>
            <ul className="space-y-1">
                {data.students.map((student) => (
                    <li key={student.id} className="flex items-center gap-2">
                        {onSelectStudent ? (
                            <button
                                onClick={() => onSelectStudent(student.id)}
                                className="text-left w-full p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                            >
                                {student.avatar && (
                                    <img
                                        src={student.avatar}
                                        alt={student.name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                )}
                                <span>{student.name}</span>
                            </button>
                        ) : (
                            <div className="p-2 flex items-center gap-2">
                                {student.avatar && (
                                    <img
                                        src={student.avatar}
                                        alt={student.name}
                                        className="w-6 h-6 rounded-full"
                                    />
                                )}
                                <span>{student.name}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
} 