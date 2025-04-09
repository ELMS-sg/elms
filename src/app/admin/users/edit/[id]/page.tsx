'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, User, Mail, Key, Save, UserCog } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';

const editUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().optional(), // Password is optional for editing
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
});

type EditUserFormData = {
    name: string;
    email: string;
    password?: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
};

export default function EditUserPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const userId = params.id;

    const [formData, setFormData] = useState<EditUserFormData>({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
    });
    const [originalData, setOriginalData] = useState<Omit<EditUserFormData, 'password'>>({
        name: '',
        email: '',
        role: 'STUDENT',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch(`/api/users/${userId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }

                const userData = await response.json();

                // Set form data and track original data for comparison
                const userFormData = {
                    name: userData.name,
                    email: userData.email,
                    password: '', // Password is empty when editing
                    role: userData.role,
                };

                setFormData(userFormData);
                setOriginalData({
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                });

            } catch (err) {
                console.error('Error fetching user:', err);
                setServerError('Failed to load user data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchUser();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear the error for this field when it changes
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({ ...prev, role: value as 'STUDENT' | 'TEACHER' | 'ADMIN' }));

        // Clear the error for role when it changes
        if (errors.role) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.role;
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        try {
            // If password is empty, remove it from validation
            const dataToValidate = { ...formData };
            if (!dataToValidate.password) {
                delete dataToValidate.password;
            }

            editUserSchema.parse(dataToValidate);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as string] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Reset errors
        setServerError(null);

        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Prepare the update data (only include password if it was provided)
        const updateData: Partial<EditUserFormData> = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
        };

        if (formData.password) {
            updateData.password = formData.password;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user');
            }

            // Success - redirect to users list
            router.push('/admin/users');
            router.refresh();
        } catch (err) {
            console.error('Error updating user:', err);
            setServerError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-gray-500">Loading user data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-8">
                <Link href="/admin/users" className="mr-4">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
                        <div className="flex items-center ml-3 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            <UserCog className="h-3 w-3 mr-1" />
                            {formData.role}
                        </div>
                    </div>
                    <p className="text-gray-500 mt-1">Update user information for {formData.name}</p>
                </div>
            </div>

            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-1 text-sm text-red-700">{serverError}</div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900">User Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Update the user details below</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Full Name
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`pl-10 ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                    placeholder="Enter full name"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                    placeholder="Enter email address"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`pl-10 ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                            )}
                            <p className="text-sm text-gray-500">
                                Leave blank to keep the current password.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                Role
                            </Label>
                            <Select
                                value={formData.role}
                                onValueChange={handleRoleChange}
                            >
                                <SelectTrigger id="role" className={`${errors.role ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''} bg-white`}>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="STUDENT">Student</SelectItem>
                                    <SelectItem value="TEACHER">Teacher</SelectItem>
                                    <SelectItem value="ADMIN">Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 mt-8 pt-5 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/admin/users')}
                            disabled={isSubmitting}
                            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary text-white flex items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 