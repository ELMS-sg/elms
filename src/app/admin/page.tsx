'use client';

import React from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HardDrive, Database, Settings, Users, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
    const adminTools = [
        {
            title: 'Storage Management',
            description: 'Manage file storage buckets and permissions',
            icon: <HardDrive className="w-6 h-6 text-blue-500" />,
            href: '/admin/storage',
            color: 'bg-blue-50'
        },
        {
            title: 'Database',
            description: 'View and manage database tables',
            icon: <Database className="w-6 h-6 text-green-500" />,
            href: '/admin/database',
            color: 'bg-green-50'
        },
        {
            title: 'User Management',
            description: 'Manage user accounts and permissions',
            icon: <Users className="w-6 h-6 text-purple-500" />,
            href: '/admin/users',
            color: 'bg-purple-50'
        },
        {
            title: 'System Settings',
            description: 'Configure application settings',
            icon: <Settings className="w-6 h-6 text-gray-500" />,
            href: '/admin/settings',
            color: 'bg-gray-50'
        }
    ];

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {adminTools.map((tool, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className={`inline-flex p-3 rounded-lg ${tool.color} mb-3`}>
                                {tool.icon}
                            </div>
                            <CardTitle>{tool.title}</CardTitle>
                            <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline">
                                <Link href={tool.href} className="flex items-center">
                                    Open <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Overview of the application&apos;s current status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Application Version</span>
                            <span className="font-medium">1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Database Status</span>
                            <span className="font-medium text-green-600">Connected</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Storage Status</span>
                            <span className="font-medium text-green-600">Available</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
} 