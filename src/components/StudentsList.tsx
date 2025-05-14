'use client';

import { useStudentsByClass } from '@/hooks/useStudents';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';

interface StudentsListProps {
    classId: string;
    onSelectStudent?: (studentId: string) => void;
    selectedStudentId?: string;
}

export function StudentsList({ classId, onSelectStudent, selectedStudentId }: StudentsListProps) {
    const { data, isLoading, error, refetch } = useStudentsByClass(classId);
    // Internal state to track selected student
    const [internalSelectedId, setInternalSelectedId] = useState<string | undefined>(selectedStudentId);

    useEffect(() => {
        if (classId) {
            console.log(`StudentsList: Loading students for class ${classId}`);
            refetch();
        }
    }, [classId, refetch]);

    // Update internal state when prop changes
    useEffect(() => {
        setInternalSelectedId(selectedStudentId);
    }, [selectedStudentId]);

    // Log data when it changes
    useEffect(() => {
        if (data) {
            console.log(`StudentsList: Received data for class ${classId}:`, data);
        }
    }, [data, classId]);

    const handleSelectStudent = (studentId: string) => {
        setInternalSelectedId(studentId);
        if (onSelectStudent) {
            onSelectStudent(studentId);
        }
    };

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
            <ul className="space-y-1 max-h-60 overflow-y-auto">
                {data.students.map((student) => (
                    <li key={student.id} className="flex items-center gap-2">
                        {onSelectStudent ? (
                            <button
                                onClick={() => handleSelectStudent(student.id)}
                                className={`text-left w-full p-2 rounded flex items-center gap-2 transition-colors
                                    ${internalSelectedId === student.id
                                        ? 'bg-blue-100 border border-blue-500'
                                        : 'hover:bg-gray-100 border border-transparent'}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {student.avatar ? (
                                        <img
                                            src={student.avatar}
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // If image fails to load, replace with user icon
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('has-error');
                                            }}
                                        />
                                    ) : (
                                        <User className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                                <span className={internalSelectedId === student.id ? 'font-medium text-blue-700' : ''}>
                                    {student.name}
                                </span>
                            </button>
                        ) : (
                            <div className="p-2 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {student.avatar ? (
                                        <img
                                            src={student.avatar}
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // If image fails to load, replace with user icon
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('has-error');
                                            }}
                                        />
                                    ) : (
                                        <User className="h-4 w-4 text-gray-400" />
                                    )}
                                </div>
                                <span>{student.name}</span>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
} 