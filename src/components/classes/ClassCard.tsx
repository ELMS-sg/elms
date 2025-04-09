import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Users, BookOpen } from 'lucide-react';

interface ClassCardProps {
    id: string;
    name: string;
    description?: string;
    teacherName?: string;
    schedule?: string;
    image?: string;
    learningMethod?: string;
    enrolledCount?: number;
    maxStudents?: number;
    isAdmin?: boolean;
    onDelete?: (id: string) => void;
}

export function ClassCard({
    id,
    name,
    description,
    teacherName,
    schedule,
    image,
    learningMethod,
    enrolledCount = 0,
    maxStudents = 0,
    isAdmin = false,
    onDelete,
}: ClassCardProps) {

    // Handle delete button click
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onDelete) {
            onDelete(id);
        }
    };

    return (
        <Card className="w-full h-full bg-white overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
                <Image
                    src={image || '/images/default-class.jpg'}
                    alt={name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {learningMethod || 'Online'}
                </div>
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold truncate">{name}</CardTitle>
                {teacherName && (
                    <p className="text-sm text-gray-500">Instructor: {teacherName}</p>
                )}
            </CardHeader>

            <CardContent className="flex-grow">
                {description && (
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">{description}</p>
                )}

                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                        {enrolledCount} / {maxStudents} students
                    </span>
                </div>

                {schedule && (
                    <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span className="line-clamp-1">{schedule}</span>
                    </div>
                )}
            </CardContent>

            {/* Fixed footer with buttons */}
            <CardFooter className="border-t p-4 mt-auto bg-gray-50">
                <div className="flex justify-between w-full">
                    {isAdmin ? (
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="bg-white text-red-500 border-red-300 hover:bg-red-50 hover:text-red-700 border"
                        >
                            Remove
                        </Button>
                    ) : (
                        <Button variant="outline" asChild className="bg-white text-black border-gray-300 border">
                            <Link href={`/classes/${id}`}>
                                View Details
                            </Link>
                        </Button>
                    )}

                    {isAdmin && (
                        <Button variant="default" asChild className="bg-blue-400 hover:bg-blue-500">
                            <Link href={`/admin/classes/edit/${id}`}>
                                Edit
                            </Link>
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
} 