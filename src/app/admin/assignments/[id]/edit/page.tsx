'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

interface Assignment {
    id: string
    title: string
    description: string
    class_id: string
    teacher_id: string
    due_date: string
    points: number
    assignment_type: 'essay' | 'exercise' | 'quiz' | 'recording' | 'other'
    class_name: string
    teacher_name: string
}

export default function EditAssignmentPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [assignment, setAssignment] = useState<Assignment | null>(null)

    useEffect(() => {
        fetchAssignment()
    }, [params.id])

    const fetchAssignment = async () => {
        try {
            const response = await fetch(`/api/assignments/${params.id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch assignment')
            }
            const data = await response.json()
            setAssignment(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch assignment')
            toast({
                title: 'Error',
                description: 'Failed to fetch assignment details',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!assignment) return

        setSaving(true)
        try {
            const response = await fetch(`/api/assignments/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: assignment.title,
                    description: assignment.description,
                    class_id: assignment.class_id,
                    teacher_id: assignment.teacher_id,
                    due_date: assignment.due_date,
                    points: assignment.points,
                    assignment_type: assignment.assignment_type,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to update assignment')
            }

            toast({
                title: 'Success',
                description: 'Assignment updated successfully',
            })
            router.push('/admin/assignments')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update assignment')
            toast({
                title: 'Error',
                description: 'Failed to update assignment',
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error || !assignment) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Error</h1>
                    <p className="text-muted-foreground">{error || 'Assignment not found'}</p>
                    <Button
                        onClick={() => router.push('/admin/assignments')}
                        className="mt-4"
                    >
                        Back to Assignments
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Edit Assignment</h1>
                <Button
                    variant="outline"
                    onClick={() => router.push('/admin/assignments')}
                    className="bg-white"
                >
                    Back to Assignments
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={assignment.title}
                            onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
                            required
                            className="bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={assignment.assignment_type}
                            onValueChange={(value) => setAssignment({ ...assignment, assignment_type: value as Assignment['assignment_type'] })}
                        >
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="essay">Essay</SelectItem>
                                <SelectItem value="exercise">Exercise</SelectItem>
                                <SelectItem value="quiz">Quiz</SelectItem>
                                <SelectItem value="recording">Recording</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="class">Class</Label>
                        <Input
                            id="class"
                            value={assignment.class_name}
                            disabled
                            className="bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="teacher">Teacher</Label>
                        <Input
                            id="teacher"
                            value={assignment.teacher_name}
                            disabled
                            className="bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                            id="due_date"
                            type="datetime-local"
                            value={assignment.due_date}
                            onChange={(e) => setAssignment({ ...assignment, due_date: e.target.value })}
                            required
                            className="bg-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="points">Points</Label>
                        <Input
                            id="points"
                            type="number"
                            min="0"
                            value={assignment.points}
                            onChange={(e) => setAssignment({ ...assignment, points: parseInt(e.target.value) })}
                            required
                            className="bg-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={assignment.description}
                        onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
                        required
                        className="min-h-[200px] bg-white"
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/admin/assignments')}
                        className="bg-white border border-gray-900 hover:border-gray-900 text-gray-900 hover:text-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-white border border-blue-500 hover:border-blue-500 text-blue-500 hover:text-blue-600">
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
} 