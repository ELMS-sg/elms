'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Settings,
    Users,
    Database,
    BookOpen,
    FileCheck,
    Home,
    ArrowLeft,
    HardDrive
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: <Home className="w-5 h-5" /> },
        { name: 'Storage', href: '/admin/storage', icon: <HardDrive className="w-5 h-5" /> },
        { name: 'Meetings', href: '/admin/meetings', icon: <Users className="w-5 h-5" /> },
        { name: 'Fix Submissions', href: '/admin/fix-submissions', icon: <FileCheck className="w-5 h-5" /> },
        { name: 'Fix Foreign Key', href: '/admin/fix-submissions/foreign-key', icon: <Database className="w-5 h-5" /> },
        { name: 'Fix Assignment Files', href: '/admin/fix-submissions/assignment-files', icon: <FileCheck className="w-5 h-5" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-sm hidden md:block">
                <div className="px-6 pt-6 pb-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
                    </div>
                </div>
                <nav className="mt-5 px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${isActive
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                            >
                                <span className={`${isActive ? 'text-primary-500' : 'text-gray-500'
                                    } mr-3`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-8 px-4">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 text-gray-500" />
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
                <div className="py-6 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
} 