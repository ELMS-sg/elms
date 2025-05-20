'use client';

import React, { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminHelpPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // Check authorization
    useEffect(() => {
        async function checkAuth() {
            try {
                // No need for explicit auth check here as AdminLayout will handle it
                setIsLoading(false);
            } catch (error) {
                console.error('Error checking auth:', error);
                router.push('/unauthorized');
            }
        }

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Administrator Help & Documentation</h1>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="prose max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
                        <p>
                            Welcome to the Administrator Dashboard for the Learning Management System.
                            As an administrator, you have complete access to manage all aspects of the platform,
                            including users, classes, assignments, and system settings.
                        </p>

                        <div className="my-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="dashboard">Dashboard Navigation</h2>
                            <p>
                                Your administrator dashboard gives you quick access to key metrics and functionalities:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Left Sidebar:</strong> Main navigation menu with links to all admin sections</li>
                                <li><strong>Overview Cards:</strong> Quick metrics showing user counts, active classes, and system status</li>
                                <li><strong>Recent Activity:</strong> Latest actions performed across the platform</li>
                            </ul>
                        </div>

                        <div className="my-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="users">User Management</h2>
                            <p>
                                The Users section allows you to manage all user accounts in the system:
                            </p>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Users</h3>
                            <p>
                                Access the Users list by clicking "Users" in the admin sidebar. Here you can:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>View all users with their basic information (name, email, role)</li>
                                <li>Use the search bar to find specific users by name or email</li>
                                <li>Filter users by role using the dropdown menu</li>
                                <li>Sort users by name, registration date, or role</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Creating Users</h3>
                            <p>
                                To create a new user:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click the "Create User" button in the top-right of the Users page</li>
                                <li>Fill in the required information:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Full Name</li>
                                        <li>Email Address (must be unique)</li>
                                        <li>Password (must meet security requirements)</li>
                                        <li>Role (Admin, Teacher, or Student)</li>
                                    </ul>
                                </li>
                                <li>Optionally upload a profile avatar</li>
                                <li>Click "Create User" to finalize</li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Editing Users</h3>
                            <p>
                                To edit a user's information:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Find the user in the Users list</li>
                                <li>Click the edit (pencil) icon next to their name</li>
                                <li>Modify any fields as needed</li>
                                <li>Click "Save Changes" to apply your modifications</li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">User Details</h3>
                            <p>
                                To view detailed information about a user:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click on a user's name in the Users list</li>
                                <li>Review their profile, which includes:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Basic profile information</li>
                                        <li>Activity statistics</li>
                                        <li>For students: enrolled classes and assignment performance</li>
                                        <li>For teachers: classes taught and assignment creation statistics</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>

                        <div className="my-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="classes">Class Management</h2>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Classes</h3>
                            <p>
                                Access the Classes list by clicking "Classes" in the admin sidebar. Here you can:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>View all classes with key information displayed in a card layout</li>
                                <li>Filter classes by status (Active, Upcoming, Archived)</li>
                                <li>Filter by teacher using the dropdown menu</li>
                                <li>Search for specific classes by name</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Creating Classes</h3>
                            <p>
                                To create a new class:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click the "Create Class" button on the Classes page</li>
                                <li>Fill in the class details:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Class Name (required)</li>
                                        <li>Description (required)</li>
                                        <li>Teacher (select from dropdown)</li>
                                        <li>Start and End Dates</li>
                                        <li>Maximum Capacity (optional)</li>
                                    </ul>
                                </li>
                                <li>Optionally upload a class banner image</li>
                                <li>Click "Create Class" to finalize</li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Class Details</h3>
                            <p>
                                To view detailed information about a class:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click on a class card in the Classes list</li>
                                <li>Review the class details page, which includes:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Class information and description</li>
                                        <li>Enrolled students list with progress indicators</li>
                                        <li>Assignments tab showing all assignments for this class</li>
                                        <li>Meetings tab displaying scheduled meetings</li>
                                        <li>Analytics tab with performance metrics</li>
                                    </ul>
                                </li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Managing Enrollments</h3>
                            <p>
                                From the class details page, you can manage student enrollments:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click the "Manage Enrollments" button</li>
                                <li>To add students:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Click "Add Students"</li>
                                        <li>Search for students by name or email</li>
                                        <li>Select students from the list</li>
                                        <li>Click "Add Selected Students"</li>
                                    </ul>
                                </li>
                                <li>To remove students:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Find the student in the enrolled list</li>
                                        <li>Click the remove (X) icon next to their name</li>
                                        <li>Confirm the removal</li>
                                    </ul>
                                </li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Editing Classes</h3>
                            <p>
                                To edit a class:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>From the class details page, click "Edit Class"</li>
                                <li>Modify any fields as needed</li>
                                <li>Click "Save Changes" to apply your modifications</li>
                            </ol>
                        </div>

                        <div className="my-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="assignments">Assignment Management</h2>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Assignments</h3>
                            <p>
                                Access the Assignments list by clicking "Assignments" in the admin sidebar. Here you can:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>View all assignments across all classes</li>
                                <li>Filter assignments by class, teacher, or type</li>
                                <li>Search for specific assignments by title</li>
                                <li>Sort by due date, creation date, or submission rate</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Assignment Details</h3>
                            <p>
                                To view detailed information about an assignment:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click on an assignment title in the Assignments list</li>
                                <li>Review the assignment details, which includes:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Assignment information and instructions</li>
                                        <li>Due date and status</li>
                                        <li>Associated class and teacher</li>
                                        <li>Submission statistics</li>
                                        <li>Student performance metrics</li>
                                    </ul>
                                </li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Editing Assignments</h3>
                            <p>
                                To edit an assignment:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>From the assignment details page, click "Edit Assignment"</li>
                                <li>Modify any fields as needed:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>Title and description</li>
                                        <li>Due date</li>
                                        <li>Points value</li>
                                        <li>Assignment type</li>
                                        <li>Attached files</li>
                                    </ul>
                                </li>
                                <li>Click "Save Changes" to apply your modifications</li>
                            </ol>
                        </div>

                        <div className="my-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="system">System Maintenance</h2>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Storage Management</h3>
                            <p>
                                To manage system storage:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click "Storage" in the admin sidebar</li>
                                <li>Review the storage dashboard showing usage statistics</li>
                                <li>View breakdowns by file category</li>
                                <li>Use the cleanup tools to manage unused files:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>View files by category</li>
                                        <li>Delete unused files</li>
                                        <li>Set automatic cleanup rules</li>
                                    </ul>
                                </li>
                            </ol>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Database Maintenance</h3>
                            <p>
                                To fix common database issues:
                            </p>
                            <ol className="list-decimal pl-6 mt-2 space-y-2">
                                <li>Click "Fix Submissions" in the admin sidebar</li>
                                <li>Choose from available maintenance tools:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li><strong>Foreign Key Repair:</strong> Fix broken database relationships</li>
                                        <li><strong>Assignment Files:</strong> Manage orphaned files</li>
                                    </ul>
                                </li>
                                <li>For each tool:
                                    <ul className="list-disc pl-6 mt-1">
                                        <li>The system will scan for issues</li>
                                        <li>View identified problems</li>
                                        <li>Click "Fix Issues" to repair automatically</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>

                        <div className="my-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="best-practices">Administrative Best Practices</h2>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">User Management</h3>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Regular User Audits:</strong> Review user accounts monthly to ensure appropriate access levels</li>
                                <li><strong>Password Policies:</strong> Encourage strong passwords and regular changes</li>
                                <li><strong>Role Assignment:</strong> Only assign admin privileges to those who require full system access</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Class Management</h3>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Class Oversight:</strong> Monitor class enrollments to ensure proper teacher-student ratios</li>
                                <li><strong>Archive Old Classes:</strong> Regularly archive completed classes to keep the system organized</li>
                                <li><strong>Teacher Assignment:</strong> Ensure teachers are properly matched to appropriate classes</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">System Maintenance</h3>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Regular Backups:</strong> Ensure the system database is backed up regularly</li>
                                <li><strong>Storage Cleanup:</strong> Periodically review and clean up unused files</li>
                                <li><strong>Database Integrity:</strong> Run database maintenance tools monthly to ensure data integrity</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Reference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-2">User Management</h3>
                            <ul className="list-disc pl-4 text-sm">
                                <li><Link href="#users" className="text-primary-600 hover:text-primary-800">Managing Users</Link></li>
                                <li><Link href="/admin/users/create" className="text-primary-600 hover:text-primary-800">Create User</Link></li>
                                <li><Link href="/admin/users" className="text-primary-600 hover:text-primary-800">View All Users</Link></li>
                            </ul>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Class Management</h3>
                            <ul className="list-disc pl-4 text-sm">
                                <li><Link href="#classes" className="text-primary-600 hover:text-primary-800">Managing Classes</Link></li>
                                <li><Link href="/admin/classes/create" className="text-primary-600 hover:text-primary-800">Create Class</Link></li>
                                <li><Link href="/admin/classes" className="text-primary-600 hover:text-primary-800">View All Classes</Link></li>
                            </ul>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-2">System Tools</h3>
                            <ul className="list-disc pl-4 text-sm">
                                <li><Link href="#system" className="text-primary-600 hover:text-primary-800">System Maintenance</Link></li>
                                <li><Link href="/admin/storage" className="text-primary-600 hover:text-primary-800">Storage Management</Link></li>
                                <li><Link href="/admin/fix-submissions" className="text-primary-600 hover:text-primary-800">Database Repairs</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
} 