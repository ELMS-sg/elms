'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Pencil, Trash2, Shield, UserRound, Search, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/admin/DeleteConfirmationDialog';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    avatar_url?: string;
    created_at: string;
};

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    user =>
                        user.name.toLowerCase().includes(query) ||
                        user.email.toLowerCase().includes(query) ||
                        user.role.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users]);

    async function fetchUsers() {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/users/admin');

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteClick = (user: User) => {
        console.log('Delete clicked for user:', user.name);
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        console.log('Confirming deletion of user:', userToDelete.name);
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            console.log('Delete response:', response.status, result);

            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete user');
            }

            // Remove the deleted user from the list
            const updatedUsers = users.filter(user => user.id !== userToDelete.id);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);

            // Show success message
            alert('User deleted successfully');
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge className="bg-red-500 hover:bg-red-600">{role}</Badge>;
            case 'TEACHER':
                return <Badge className="bg-blue-500 hover:bg-blue-600">{role}</Badge>;
            case 'STUDENT':
                return <Badge className="bg-green-500 hover:bg-green-600">{role}</Badge>;
            default:
                return <Badge>{role}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const userCountByRole = {
        total: users.length,
        admin: users.filter(user => user.role === 'ADMIN').length,
        teacher: users.filter(user => user.role === 'TEACHER').length,
        student: users.filter(user => user.role === 'STUDENT').length,
    };

    return (
        <AdminLayout>
            <div className="py-8 w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                        <p className="text-gray-500">Manage all your system users in one place</p>
                    </div>
                    <Link href="/admin/users/create" className="mt-4 md:mt-0">
                        <Button className="bg-primary text-white hover:bg-primary/90 transition-colors">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New User
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Total Users</span>
                        <span className="text-3xl font-bold mt-2">{userCountByRole.total}</span>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Administrators</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{userCountByRole.admin}</span>
                            <Badge className="bg-red-500 ml-2">ADMIN</Badge>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Teachers</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{userCountByRole.teacher}</span>
                            <Badge className="bg-blue-500 ml-2">TEACHER</Badge>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Students</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{userCountByRole.student}</span>
                            <Badge className="bg-green-500 ml-2">STUDENT</Badge>
                        </div>
                    </div>
                </div>

                {/* Search and filter */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                        type="search"
                        placeholder="Search users by name, email or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-1 text-sm text-red-700">{error}</div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-gray-500">Loading users...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="relative overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="min-w-[300px]">User</TableHead>
                                        <TableHead className="min-w-[250px]">Email</TableHead>
                                        <TableHead className="min-w-[100px]">Role</TableHead>
                                        <TableHead className="min-w-[100px]">Created</TableHead>
                                        <TableHead className="min-w-[200px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                                                {searchQuery ? (
                                                    <>
                                                        <div className="flex justify-center mb-2">
                                                            <Search className="h-10 w-10 text-gray-300" />
                                                        </div>
                                                        <p className="font-medium">No users found matching "{searchQuery}"</p>
                                                        <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-center mb-2">
                                                            <UserRound className="h-10 w-10 text-gray-300" />
                                                        </div>
                                                        <p className="font-medium">No users found</p>
                                                        <p className="text-sm mt-1">Create your first user to get started</p>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.id} className="hover:bg-gray-50 border-t border-gray-100">
                                                <TableCell className="font-medium min-h-[80px] py-4">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                                                            {user.avatar_url ? (
                                                                <img
                                                                    src={user.avatar_url}
                                                                    alt={user.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <UserRound className="h-5 w-5 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{user.name}</div>
                                                            {user.role === 'ADMIN' && (
                                                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                                                    <Shield className="h-3 w-3 mr-1 text-red-500" />
                                                                    Administrator
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 min-h-[80px] py-4">{user.email}</TableCell>
                                                <TableCell className="min-h-[80px] py-4">{getRoleBadge(user.role)}</TableCell>
                                                <TableCell className="text-gray-600 min-h-[80px] py-4">{formatDate(user.created_at)}</TableCell>
                                                <TableCell className="text-right min-h-[80px] py-4">
                                                    <div className="flex justify-end space-x-2">
                                                        {user.role === 'TEACHER' && (
                                                            <Link href={`/admin/teachers/${user.id}`}>
                                                                <Button variant="outline" size="sm" className="h-9 px-3 border-gray-200 hover:bg-gray-50 bg-white">
                                                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                                                    <span className="ml-2 hidden sm:inline">View Classes</span>
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        {user.role === 'STUDENT' && (
                                                            <Link href={`/admin/students/${user.id}`}>
                                                                <Button variant="outline" size="sm" className="h-9 px-3 border-gray-200 hover:bg-gray-50 bg-white">
                                                                    <GraduationCap className="h-4 w-4 text-green-600" />
                                                                    <span className="ml-2 hidden sm:inline">View Classes</span>
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Link href={`/admin/users/edit/${user.id}`}>
                                                            <Button variant="outline" size="sm" className="h-9 px-3 border-gray-200 hover:bg-gray-50 bg-white">
                                                                <Pencil className="h-4 w-4 text-blue-600" />
                                                                <span className="ml-2 hidden sm:inline">Edit</span>
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-9 px-3 border-gray-200 hover:bg-red-50 text-red-600 bg-white"
                                                            onClick={() => handleDeleteClick(user)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="ml-2 hidden sm:inline">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}