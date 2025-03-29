"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import ClientOnly from "@/components/ClientOnly"
import { serverSignOut } from "@/lib/actions"
import { Avatar } from "@/components/Avatar"

import {
    Home,
    BookOpen,
    Calendar,
    FileText,
    Bell,
    LogOut,
    Menu,
    X,
    User,
    ClipboardList,
    Settings
} from "lucide-react"
import { useState } from "react"

interface DashboardNavProps {
    user: {
        id: string
        email?: string
        name?: string | null
        avatar_url?: string | null
        role?: string
    }
}

export function DashboardNav({ user }: DashboardNavProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const displayName = user?.name || user?.email?.split('@')[0] || 'User'
    const isAdmin = user?.role === 'ADMIN'
    const isTeacher = user?.role === 'TEACHER'
    console.log(user)

    const navigation = [
        {
            name: "Dashboard",
            href: "/dashboard",
            current: pathname === "/dashboard",
            icon: <Home className="w-5 h-5" />
        },
        {
            name: "Classes",
            href: "/dashboard/classes",
            current: pathname === "/dashboard/classes" || pathname.startsWith("/dashboard/classes/"),
            icon: <BookOpen className="w-5 h-5" />
        },
        {
            name: "Assignments",
            href: "/dashboard/assignments",
            current: pathname === "/dashboard/assignments" || pathname.startsWith("/dashboard/assignments/"),
            icon: <FileText className="w-5 h-5" />
        },
        {
            name: "Meetings",
            href: "/dashboard/meetings",
            current: pathname === "/dashboard/meetings" || pathname.startsWith("/dashboard/meetings/"),
            icon: <Calendar className="w-5 h-5" />
        },
        {
            name: "Profile",
            href: "/dashboard/profile",
            current: pathname === "/dashboard/profile",
            icon: <User className="w-5 h-5" />
        },
    ]

    // Add admin link if user is admin
    if (isAdmin) {
        navigation.push({
            name: "Admin",
            href: "/admin",
            current: pathname.startsWith("/admin"),
            icon: <Settings className="w-5 h-5" />
        })
    }

    return (
        <nav className="bg-white shadow-sm fixed w-full top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-gray-900">LMS</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`${item.current
                                        ? "border-primary-600 text-primary-700"
                                        : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-800"
                                        } inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <ClientOnly>
                            <div className="flex-shrink-0 flex items-center">
                                <button className="p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 mr-2 relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
                                </button>
                                <div className="hidden md:flex items-center">
                                    <Avatar
                                        url={user.avatar_url}
                                        name={displayName}
                                        size="sm"
                                        className="mr-3"
                                    />
                                    <span className="text-sm font-medium text-gray-700 mr-4">
                                        {displayName}
                                    </span>
                                </div>
                                <form action={serverSignOut}>
                                    <button
                                        type="submit"
                                        className="hidden md:inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors duration-200"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign out
                                    </button>
                                </form>

                                {/* Mobile menu button */}
                                <button
                                    className="md:hidden ml-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? (
                                        <X className="w-6 h-6" />
                                    ) : (
                                        <Menu className="w-6 h-6" />
                                    )}
                                </button>
                            </div>
                        </ClientOnly>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${item.current
                                    ? "bg-gray-100 text-primary-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    } px-3 py-2 rounded-md text-base font-medium flex items-center`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex items-center px-3">
                                <Avatar
                                    url={user.avatar_url}
                                    name={displayName}
                                    size="md"
                                    className="mr-3"
                                />
                                <div>
                                    <div className="text-base font-medium text-gray-800">{displayName}</div>
                                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 px-2">
                                <form action={serverSignOut}>
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Sign out
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
} 