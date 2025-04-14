'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, setDate } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Teacher {
    id: string;
    name: string;
}

export default function CreateClassPage() {
    const router = useRouter();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [learningMethod, setLearningMethod] = useState('Online');
    const [maxStudents, setMaxStudents] = useState('30');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [tags, setTags] = useState('');
    const [schedule, setSchedule] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [meetingUrl, setMeetingUrl] = useState('');

    // Fetch teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const response = await fetch('/api/teachers');
                if (!response.ok) {
                    throw new Error('Failed to fetch teachers');
                }
                const data = await response.json();
                setTeachers(data);
            } catch (err) {
                console.error('Error fetching teachers:', err);
                setError('Failed to load teachers. Please try again later.');
            }
        };

        fetchTeachers();
    }, []);

    // Redirect after successful creation
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                router.push('/admin/classes');
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [success, router]);

    // Add a mapping function to convert UI-friendly names to database values
    const mapLearningMethodToDbValue = (method: string) => {
        const map: Record<string, string> = {
            "Online": "ONLINE",
            "In-Person": "IN_PERSON",
            "Blended": "BLENDED"
        };
        return map[method] || "ONLINE";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        setError(null);

        try {
            const formData = {
                name,
                description,
                teacher_id: teacherId,
                learning_method: learningMethod,
                max_students: parseInt(maxStudents),
                start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                schedule: schedule,
                image: imageUrl,
                meeting_url: meetingUrl
            };

            // Use the new admin-create endpoint to bypass RLS
            const response = await fetch('/api/classes/admin-create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create class');
            }

            setSuccess(true);
        } catch (err) {
            console.error('Error creating class:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto py-6">
                <h1 className="text-2xl font-bold mb-6">Create New Class</h1>

                {success ? (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                        <AlertTitle>Success!</AlertTitle>
                        <AlertDescription>
                            Class created successfully. Redirecting to classes list...
                        </AlertDescription>
                    </Alert>
                ) : null}

                {error ? (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}

                <Card>
                    <CardHeader>
                        <CardTitle>Class Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Class Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter class name"
                                    className="bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter class description"
                                    rows={4}
                                    className="bg-white text-black border-gray-300 border"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="teacher">Teacher <span className="text-red-500">*</span></Label>
                                <Select value={teacherId} onValueChange={setTeacherId} required>
                                    <SelectTrigger className="bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Select a teacher" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-black border-gray-300 border">
                                        {teachers.map((teacher) => (
                                            <SelectItem key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="learningMethod">Learning Method</Label>
                                <Select value={learningMethod} onValueChange={setLearningMethod}>
                                    <SelectTrigger className="bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Select learning method" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-black border-gray-300 border">
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="In-Person">In-Person</SelectItem>
                                        <SelectItem value="Blended">Blended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-white text-black border-gray-300 border",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? format(startDate, "PPP") : "Select start date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal bg-white text-black border-gray-300 border",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "PPP") : "Select end date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-white text-black border-gray-300 border">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schedule">Schedule</Label>
                                <Textarea
                                    id="schedule"
                                    value={schedule}
                                    onChange={(e) => setSchedule(e.target.value)}
                                    placeholder="e.g., Mondays and Wednesdays, 6:00 PM - 8:00 PM"
                                    className="bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Please use format like: "Mondays and Wednesdays, 6:00 PM - 8:00 PM" or "Saturdays, 10:00 AM - 12:00 PM"
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxStudents">Maximum Students</Label>
                                <Input
                                    id="maxStudents"
                                    type="number"
                                    min="1"
                                    value={maxStudents}
                                    className='bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0'
                                    onChange={(e) => setMaxStudents(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input
                                    id="tags"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    placeholder="English, Language, Beginner"
                                    className='bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0'
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="Enter image URL"
                                    className='bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0'
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    URL to the class image. Use a square image for best results.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meetingUrl">Meeting URL</Label>
                                <Input
                                    id="meetingUrl"
                                    value={meetingUrl}
                                    onChange={(e) => setMeetingUrl(e.target.value)}
                                    placeholder="Enter meeting URL"
                                    className='bg-white text-black border-gray-300 border focus:border-gray-300 focus:ring-0 focus:ring-offset-0'
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Link to virtual meeting room (Zoom, Google Meet, etc.) for online classes.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mr-2 bg-white text-black border-gray-300 border"
                                    onClick={() => router.push('/admin/classes')}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button className="bg-blue-500 text-white border-gray-300 border" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : 'Create Class'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
} 