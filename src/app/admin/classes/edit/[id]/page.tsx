'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import EditClassForm from '@/components/classes/EditClassForm';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Teacher {
    id: string;
    name: string;
}

interface ClassDetails {
    id: string;
    name: string;
    description: string;
    teacher_id: string;
    start_date: string;
    end_date: string;
    learning_method: string;
    max_students: number;
    tags: string[];
    schedule: string;
    image?: string;
}

export default function EditClassPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [classData, setClassData] = useState<ClassDetails | null>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const teachersResponse = await fetch('/api/teachers');
                if (!teachersResponse.ok) {
                    throw new Error('Failed to fetch teachers');
                }
                const teachersData = await teachersResponse.json();
                setTeachers(teachersData);

                const classResponse = await fetch(`/api/classes/${params.id}`);
                if (!classResponse.ok) {
                    throw new Error('Failed to fetch class details');
                }
                const classDetails = await classResponse.json();
                setClassData(classDetails);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'An error occurred while fetching data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    const handleSuccess = () => {
        setTimeout(() => {
            router.push('/admin/classes');
        }, 1500);
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Edit Class</h1>
                    <p className="text-gray-500">Update class information</p>
                </div>

                {isLoading ? (
                    <Card>
                        <CardContent className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-red-500">{error}</div>
                        </CardContent>
                    </Card>
                ) : classData ? (
                    <EditClassForm
                        classData={classData}
                        teachers={teachers}
                        onSuccess={handleSuccess}
                    />
                ) : (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-muted-foreground">
                                Class not found
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
} 