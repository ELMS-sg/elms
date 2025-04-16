"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Calendar,
    Clock,
    Video,
    X,
    Users,
    Plus,
    BookOpen,
    ExternalLink,
    ChevronDown
} from "lucide-react";
import { Avatar } from "@/components/Avatar";

export function FilteredMeetings({ upcomingMeetings, pastMeetings, isTeacher }) {
    const searchParams = useSearchParams();

    const [filteredUpcoming, setFilteredUpcoming] = useState(upcomingMeetings);
    const [filteredPast, setFilteredPast] = useState(pastMeetings);
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);

    // Number of meetings to show initially
    const initialMeetingsCount = 6;

    // Helper function to safely format dates
    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";

        try {
            // Check if dateStr is just a time string (e.g., "10:00 AM")
            if (dateStr.match(/^\d{1,2}:\d{2}(:\d{2})?\s?(AM|PM)?$/i)) {
                return dateStr; // Return the time string as is
            }

            // Try parsing with built-in Date constructor
            const date = new Date(dateStr);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return dateStr; // If invalid, return the original string
            }

            // Return formatted date
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateStr; // Return original string on error
        }
    };

    // Format just the time portion of a date
    const formatTime = (dateStr) => {
        if (!dateStr) return "";

        try {
            const date = new Date(dateStr);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                // If it's already just a time, return it as is
                if (dateStr.match(/^\d{1,2}:\d{2}(:\d{2})?\s?(AM|PM)?$/i)) {
                    return dateStr;
                }
                return "";
            }

            // Return just the time portion
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error("Error formatting time:", error);
            return "";
        }
    };

    // Format full date with day of week
    const formatDateWithDay = (dateStr) => {
        if (!dateStr) return "N/A";

        try {
            const date = new Date(dateStr);

            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return dateStr;
            }

            // Return formatted date with day of week
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateStr;
        }
    };

    // Apply filters based on search and category
    useEffect(() => {
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "All Meetings";

        // Filter upcoming meetings
        let upcoming = [...upcomingMeetings];
        let past = [...pastMeetings];

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();

            upcoming = upcoming.filter(meeting =>
                meeting.title.toLowerCase().includes(searchLower) ||
                (meeting.description && meeting.description.toLowerCase().includes(searchLower)) ||
                (meeting.relatedClass?.name && meeting.relatedClass.name.toLowerCase().includes(searchLower)) ||
                (meeting.teacher?.name && meeting.teacher.name.toLowerCase().includes(searchLower)) ||
                (meeting.studentName && meeting.studentName.toLowerCase().includes(searchLower))
            );

            past = past.filter(meeting =>
                meeting.title.toLowerCase().includes(searchLower) ||
                (meeting.description && meeting.description.toLowerCase().includes(searchLower)) ||
                (meeting.relatedClass?.name && meeting.relatedClass.name.toLowerCase().includes(searchLower)) ||
                (meeting.teacher?.name && meeting.teacher.name.toLowerCase().includes(searchLower)) ||
                (meeting.studentName && meeting.studentName.toLowerCase().includes(searchLower))
            );
        }

        // Apply category filter
        if (category !== "All Meetings") {
            const filterType = category === "One-on-One" ? "ONE_ON_ONE" : "GROUP";
            upcoming = upcoming.filter(meeting => meeting.type === filterType);
            past = past.filter(meeting => meeting.type === filterType);
        }

        setFilteredUpcoming(upcoming);
        setFilteredPast(past);
        // Reset show all state when filters change
        setShowAllUpcoming(false);
    }, [searchParams, upcomingMeetings, pastMeetings]);

    // Determine which meetings to display based on showAllUpcoming state
    const displayedUpcomingMeetings = showAllUpcoming
        ? filteredUpcoming
        : filteredUpcoming.slice(0, initialMeetingsCount);

    return (
        <>
            {/* Upcoming Meetings Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Upcoming Meetings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUpcoming.length > 0 ? (
                        <>
                            {displayedUpcomingMeetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
                                >
                                    <div className="p-5 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-md ${meeting.type === "ONE_ON_ONE"
                                                    ? "bg-primary-50 text-primary-600"
                                                    : "bg-yellow-50 text-yellow-600"
                                                    }`}>
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <span className="ml-2 text-sm font-medium text-gray-500">
                                                    {meeting.type === "ONE_ON_ONE" ? "One-on-One" : "Group Session"}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                {meeting.displayDate}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {meeting.title}
                                        </h3>

                                        {meeting.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {meeting.description}
                                            </p>
                                        )}

                                        <div className="mt-auto">
                                            <div className="flex items-center mb-3">
                                                <Avatar
                                                    url={meeting.teacher.avatar_url}
                                                    name={meeting.teacher.name}
                                                    size="sm"
                                                />
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{meeting.teacher.name}</p>
                                                    <p className="text-xs text-gray-500">{meeting.teacher.title}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <Clock className="h-4 w-4 mr-2" />
                                                <span>
                                                    {formatDateWithDay(meeting.startTime)}
                                                    {meeting.duration ? ` (${meeting.duration})` : ''}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <Video className="h-4 w-4 mr-2 text-primary-600" />
                                                <span>Zoom Meeting</span>
                                            </div>

                                            {meeting.type === "ONE_ON_ONE" && meeting.studentName && (
                                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    <span>With: {meeting.studentName}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm text-gray-500 mb-0">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                <span>Class: {meeting.relatedClass.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 mt-auto">
                                        <div className="grid grid-cols-12 gap-2">
                                            <a
                                                href={meeting.meetingLink || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="col-span-12 btn btn-primary btn-sm flex items-center justify-center"
                                            >
                                                <Video className="w-4 h-4 mr-2" />
                                                Join Meeting
                                            </a>
                                        </div>
                                        {isTeacher && meeting.meetingId && (
                                            <div className="mt-2 text-xs text-gray-500 flex items-center">
                                                <span className="mr-1">Zoom Meeting ID:</span>
                                                <span className="font-medium">{meeting.meetingId}</span>
                                                {meeting.meetingLink && (
                                                    <a
                                                        href={meeting.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="ml-auto text-primary-600 hover:text-primary-700 flex items-center"
                                                    >
                                                        Edit <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* View More Button */}
                            {filteredUpcoming.length > initialMeetingsCount && (
                                <div className="col-span-full flex justify-center my-6">
                                    <button
                                        onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                                        className="btn btn-outline flex items-center gap-2"
                                    >
                                        {showAllUpcoming ? 'Show Less' : 'View More'}
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showAllUpcoming ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="col-span-3 py-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                <Calendar className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Meetings</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                                {isTeacher
                                    ? "You don't have any scheduled meetings. Create a new Zoom meeting to get started."
                                    : "You don't have any upcoming meetings scheduled."}
                            </p>
                            {isTeacher && (
                                <Link href="/dashboard/meetings/create" className="btn btn-primary">
                                    Create Meeting
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Past Meetings Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Past Meetings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPast.length > 0 ? (
                        filteredPast.map((meeting) => (
                            <div
                                key={meeting.id}
                                className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full opacity-75"
                            >
                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-md ${meeting.type === "ONE_ON_ONE"
                                                ? "bg-primary-50 text-primary-600"
                                                : "bg-yellow-50 text-yellow-600"
                                                }`}>
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <span className="ml-2 text-sm font-medium text-gray-500">
                                                {meeting.type === "ONE_ON_ONE" ? "One-on-One" : "Group Session"}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2">
                                                {meeting.displayDate}
                                            </span>
                                            <span className="badge badge-outline">Completed</span>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {meeting.title}
                                    </h3>

                                    {meeting.description && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {meeting.description}
                                        </p>
                                    )}

                                    <div className="mt-auto">
                                        <div className="flex items-center mb-3">
                                            <Avatar
                                                url={meeting.teacher.avatar_url}
                                                name={meeting.teacher.name}
                                                size="sm"
                                            />
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{meeting.teacher.name}</p>
                                                <p className="text-xs text-gray-500">{meeting.teacher.title}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span>
                                                {formatDateWithDay(meeting.startTime)}
                                                {meeting.duration ? ` (${meeting.duration})` : ''}
                                            </span>
                                        </div>

                                        {meeting.type === "ONE_ON_ONE" && meeting.studentName && (
                                            <div className="flex items-center text-sm text-gray-500 mb-3">
                                                <Users className="h-4 w-4 mr-2" />
                                                <span>With: {meeting.studentName}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-sm text-gray-500 mb-0">
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            <span>Class: {meeting.relatedClass.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 mt-auto">
                                    {isTeacher && (
                                        <button className="w-full btn btn-outline btn-sm flex items-center justify-center">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Schedule Similar Meeting
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3 py-8 text-center">
                            <p className="text-gray-600">No past meetings found.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 