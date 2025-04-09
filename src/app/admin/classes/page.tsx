'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClassCard } from '@/components/classes/ClassCard';

interface Class {
    id: string;
    name: string;
    description: string;
    teacher: string;
    teacherId: string;
    startDate: string;
    endDate: string;
    learningMethod: string;
    totalStudents: number;
    image?: string;
    tags?: string[];
    schedule?: string;
    maxStudents?: number;
}

export default function AdminClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const fetchClasses = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/classes/admin');

            if (!response.ok) {
                throw new Error('Failed to fetch classes');
            }

            const data = await response.json();
            console.log('Classes data:', data);

            const processedData = data.map(cls => ({
                ...cls,
                schedule: cls.schedule || 'Flexible schedule'
            }));

            setClasses(processedData);
            setFilteredClasses(processedData);
        } catch (err) {
            setError('Error fetching classes. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredClasses(classes);
            return;
        }

        const lowerCaseSearch = searchTerm.toLowerCase();
        const filtered = classes.filter(
            (cls) =>
                cls.name.toLowerCase().includes(lowerCaseSearch) ||
                cls.teacher.toLowerCase().includes(lowerCaseSearch)
        );

        setFilteredClasses(filtered);
    }, [searchTerm, classes]);

    // Handle class deletion
    const handleDelete = async (id: string) => {
        // Confirm with a native confirm dialog
        if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/classes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete class');
            }

            // Remove the deleted class from state
            setClasses(classes.filter(c => c.id !== id));
            setFilteredClasses(filteredClasses.filter(c => c.id !== id));

            alert('Class deleted successfully');
        } catch (error) {
            console.error('Error deleting class:', error);
            alert('Error: ' + (error.message || 'Failed to delete class. Please try again.'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Classes Management</h1>
                    <Link href="/admin/classes/create">
                        <Button className="gap-2 bg-white text-black border-gray-300 border">
                            <Plus className="h-4 w-4" />
                            Create Class
                        </Button>
                    </Link>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by class name or teacher..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-red-500">{error}</div>
                        </CardContent>
                    </Card>
                ) : filteredClasses.length === 0 ? (
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center text-muted-foreground">
                                No classes found. {searchTerm ? 'Try a different search term.' : ''}
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredClasses.map((cls) => (
                            <div key={cls.id} className="h-full">
                                <ClassCard
                                    id={cls.id}
                                    name={cls.name}
                                    description={cls.description}
                                    teacherName={cls.teacher}
                                    schedule={cls.schedule}
                                    image={cls.image}
                                    learningMethod={cls.learningMethod}
                                    enrolledCount={cls.totalStudents}
                                    maxStudents={cls.maxStudents || 30}
                                    isAdmin={true}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
} 