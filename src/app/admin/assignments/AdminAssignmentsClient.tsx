'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Pencil, Trash2, Search, BookOpen, Calendar, GraduationCap, Eye } from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationDialog } from '@/components/admin/DeleteConfirmationDialog'
import { Input } from '@/components/ui/input'
import AdminLayout from '@/components/admin/AdminLayout'
import { toast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Assignment = {
    id: string
    title: string
    description: string
    class_id: string
    teacher_id: string
    due_date: string
    points: number
    assignment_type: 'essay' | 'exercise' | 'quiz' | 'recording' | 'other'
    created_at: string
    class_name?: string
    teacher_name?: string
}

interface AdminAssignmentsClientProps {
    initialAssignments: Assignment[]
}

export default function AdminAssignmentsClient({ initialAssignments }: AdminAssignmentsClientProps) {
    const router = useRouter()
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
    const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(initialAssignments)
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [selectedClass, setSelectedClass] = useState<string>('all')
    const [classes, setClasses] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        fetchAssignments()
    }, [])

    useEffect(() => {
        // Extract unique classes for filter
        const uniqueClasses = Array.from(
            new Set(assignments.map(a => a.class_id))
        ).map(id => {
            const assignment = assignments.find(a => a.class_id === id)
            return {
                id: id as string,
                name: assignment?.class_name || 'Unknown Class'
            }
        })
        setClasses(uniqueClasses)
    }, [assignments])

    useEffect(() => {
        filterAssignments()
    }, [searchQuery, assignments, selectedClass])

    const fetchAssignments = async () => {
        try {
            const response = await fetch('/api/assignments/admin')
            if (!response.ok) {
                throw new Error('Failed to fetch assignments')
            }
            const data = await response.json()
            setAssignments(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            toast({
                title: 'Error',
                description: 'Failed to fetch assignments',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const filterAssignments = () => {
        let filtered = assignments

        // Filter by class
        if (selectedClass !== 'all') {
            filtered = filtered.filter(assignment => assignment.class_id === selectedClass)
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(assignment =>
                assignment.title.toLowerCase().includes(query) ||
                assignment.description.toLowerCase().includes(query) ||
                assignment.class_name?.toLowerCase().includes(query) ||
                assignment.teacher_name?.toLowerCase().includes(query)
            )
        }

        setFilteredAssignments(filtered)
    }

    const handleDeleteClick = (assignment: Assignment) => {
        setAssignmentToDelete(assignment)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!assignmentToDelete) return

        setIsDeleting(true)
        try {
            const response = await fetch(`/api/assignments/${assignmentToDelete.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete assignment')
            }

            setAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id))
            setFilteredAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id))
            setIsDeleteDialogOpen(false)
            setAssignmentToDelete(null)
            toast({
                title: 'Success',
                description: 'Assignment deleted successfully',
            })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete assignment',
                variant: 'destructive',
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleEditClick = (assignment: Assignment) => {
        router.push(`/admin/assignments/${assignment.id}/edit`)
    }

    const getBadgeColor = (type: Assignment['assignment_type']) => {
        switch (type) {
            case 'essay':
                return 'bg-purple-500'
            case 'exercise':
                return 'bg-green-500'
            case 'quiz':
                return 'bg-blue-500'
            case 'recording':
                return 'bg-yellow-500'
            case 'other':
                return 'bg-gray-500'
            default:
                return 'bg-gray-500'
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const assignmentCountByType = {
        total: assignments.length,
        essay: assignments.filter(a => a.assignment_type === 'essay').length,
        exercise: assignments.filter(a => a.assignment_type === 'exercise').length,
        quiz: assignments.filter(a => a.assignment_type === 'quiz').length,
        recording: assignments.filter(a => a.assignment_type === 'recording').length,
        other: assignments.filter(a => a.assignment_type === 'other').length,
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white rounded-lg shadow">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500">Loading users...</span>
            </div>
        )
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <AdminLayout>
            <div className="py-8 w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments Management</h1>
                        <p className="text-gray-500">Manage all assignments in the system</p>
                    </div>
                    <Link href="/admin/assignments/create" className="mt-4 md:mt-0">
                        <Button className="bg-primary text-white hover:bg-primary/90 transition-colors">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Assignment
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Total Assignments</span>
                        <span className="text-3xl font-bold mt-2">{assignmentCountByType.total}</span>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Essays</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{assignmentCountByType.essay}</span>
                            <Badge className="bg-purple-500 ml-2">ESSAY</Badge>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Exercises</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{assignmentCountByType.exercise}</span>
                            <Badge className="bg-green-500 ml-2">EXERCISE</Badge>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Quizzes</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{assignmentCountByType.quiz}</span>
                            <Badge className="bg-blue-500 ml-2">QUIZ</Badge>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Recordings</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{assignmentCountByType.recording}</span>
                            <Badge className="bg-yellow-500 ml-2">RECORDING</Badge>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">Other</span>
                        <div className="flex items-center mt-2">
                            <span className="text-3xl font-bold">{assignmentCountByType.other}</span>
                            <Badge className="bg-gray-500 ml-2">OTHER</Badge>
                        </div>
                    </div>
                </div>

                {/* Search and filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="input pl-10 w-full"
                                placeholder="Search assignments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select a class" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="all">All Classes</SelectItem>
                                {classes.map(cls => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="min-w-[400px]">Assignment</TableHead>
                                    <TableHead className="min-w-[300px]">Class</TableHead>
                                    <TableHead className="min-w-[200px]">Teacher</TableHead>
                                    <TableHead className="min-w-[150px]">Type</TableHead>
                                    <TableHead className="min-w-[150px]">Due Date</TableHead>
                                    <TableHead className="min-w-[80px]">Points</TableHead>
                                    <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAssignments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                            {searchQuery ? (
                                                <>
                                                    <div className="flex justify-center mb-2">
                                                        <Search className="h-10 w-10 text-gray-300" />
                                                    </div>
                                                    <p className="font-medium">No assignments found matching "{searchQuery}"</p>
                                                    <p className="text-sm mt-1">Try adjusting your search criteria</p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-center mb-2">
                                                        <BookOpen className="h-10 w-10 text-gray-300" />
                                                    </div>
                                                    <p className="font-medium">No assignments found</p>
                                                    <p className="text-sm mt-1">Create your first assignment to get started</p>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAssignments.map((assignment) => (
                                        <TableRow key={assignment.id} className="hover:bg-gray-50 border-t border-gray-100">
                                            <TableCell className="font-medium min-h-[80px] py-4">
                                                <div className="flex flex-col">
                                                    <div className="font-medium text-gray-900">{assignment.title}</div>
                                                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">{assignment.description}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 min-h-[80px] py-4">
                                                <div className="flex items-center">
                                                    <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                                                    {assignment.class_name || 'Unknown Class'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 min-h-[80px] py-4">
                                                {assignment.teacher_name || 'Unknown Teacher'}
                                            </TableCell>
                                            <TableCell className="min-h-[80px] py-4">
                                                <Badge className={`${getBadgeColor(assignment.assignment_type)} text-white`}>
                                                    {assignment.assignment_type.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600 min-h-[80px] py-4">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                                    {formatDate(assignment.due_date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 min-h-[80px] py-4">
                                                {assignment.points}
                                            </TableCell>
                                            <TableCell className="text-right min-h-[80px] py-4">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-3 border-gray-200 hover:bg-gray-50 bg-white"
                                                        onClick={() => handleEditClick(assignment)}
                                                    >
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                        <span className="ml-2 hidden sm:inline">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-3 border-gray-200 hover:bg-red-50 text-red-600 bg-white"
                                                        onClick={() => handleDeleteClick(assignment)}
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

                <DeleteConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Assignment"
                    description={`Are you sure you want to delete "${assignmentToDelete?.title}"? This action cannot be undone.`}
                    isDeleting={isDeleting}
                />
            </div>
        </AdminLayout>
    )
} 