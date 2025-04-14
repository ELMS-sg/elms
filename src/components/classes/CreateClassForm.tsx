'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClass } from '@/lib/class-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Calendar,
    Loader2,
    CheckCircle,
    AlertCircle,
    User,
    Globe,
    MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Teacher {
    id: string;
    name: string;
}

export default function CreateClassForm({ onSuccess, teachers = [] }: {
    onSuccess?: () => void;
    teachers?: Teacher[];
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        teacher_id: '',
        start_date: '',
        end_date: '',
        learning_method: 'Hybrid',
        max_students: 30,
        tags: ['English', 'Language'],
        schedule: 'Mon, Wed, Fri - 10:00 AM to 12:00 PM',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess(false);

        // Validate the form
        if (!formData.name || !formData.description || !formData.teacher_id ||
            !formData.start_date || !formData.end_date) {
            setError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createClass(formData);
            if (result.success) {
                setSuccess(true);
                setFormData({
                    name: '',
                    description: '',
                    teacher_id: '',
                    start_date: '',
                    end_date: '',
                    learning_method: 'Hybrid',
                    max_students: 30,
                    tags: ['English', 'Language'],
                    schedule: 'Mon, Wed, Fri - 10:00 AM to 12:00 PM',
                });

                // Call the success callback if provided
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 1000);
                }
            }
        } catch (err: any) {
            console.error('Error creating class:', err);
            setError(err.message || 'Failed to create class');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Create New Class</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Class Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Class Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter class name"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter class description"
                            rows={4}
                            required
                        />
                    </div>

                    {/* Teacher Selection */}
                    <div className="space-y-2">
                        <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
                            Teacher <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={formData.teacher_id}
                            onValueChange={(value) => handleSelectChange('teacher_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.length > 0 ? (
                                    teachers.map(teacher => (
                                        <SelectItem key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-teachers" disabled>
                                        No teachers available
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Learning Method */}
                    <div className="space-y-2">
                        <label htmlFor="learning_method" className="block text-sm font-medium text-gray-700">
                            Learning Method
                        </label>
                        <Select
                            value={formData.learning_method}
                            onValueChange={(value) => handleSelectChange('learning_method', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Online">
                                    <div className="flex items-center">
                                        <Globe className="w-4 h-4 mr-2 text-primary-600" />
                                        <span>Online</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Offline">
                                    <div className="flex items-center">
                                        <MapPin className="w-4 h-4 mr-2 text-accent-red" />
                                        <span>Offline</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Hybrid">
                                    <div className="flex items-center">
                                        <Globe className="w-4 h-4 mr-2 text-accent-green" />
                                        <span>Hybrid</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-2">
                        <label htmlFor="schedule" className="block text-sm font-medium text-gray-700">
                            Schedule
                        </label>
                        <Input
                            id="schedule"
                            name="schedule"
                            value={formData.schedule}
                            onChange={handleChange}
                            placeholder="e.g., Mon, Wed, Fri - 10:00 AM to 12:00 PM"
                        />
                    </div>

                    {/* Max Students */}
                    <div className="space-y-2">
                        <label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                            Maximum Students
                        </label>
                        <Input
                            id="max_students"
                            name="max_students"
                            type="number"
                            min={1}
                            max={100}
                            value={formData.max_students}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                            Start Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                id="start_date"
                                name="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                            End Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                id="end_date"
                                name="end_date"
                                type="date"
                                value={formData.end_date}
                                onChange={handleChange}
                                required
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-start">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">Class created successfully!</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="mr-2"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Class'
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
} 