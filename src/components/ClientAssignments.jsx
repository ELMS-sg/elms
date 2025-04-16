"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight,
    Clock,
    BookOpen,
    CheckCircle,
    Upload,
    Download,
    Award,
    AlertCircle,
    CheckSquare
} from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { format } from "date-fns";

export function ClientAssignments({
    pendingAssignments,
    completedAssignments,
    assignmentsToGrade,
    isTeacher
}) {
    const searchParams = useSearchParams();

    const [filteredPending, setFilteredPending] = useState(pendingAssignments);
    const [filteredCompleted, setFilteredCompleted] = useState(completedAssignments);
    const [filteredToGrade, setFilteredToGrade] = useState(assignmentsToGrade);

    // Filter function that applies search and category filters
    const applyFilters = (items, isSubmission = false) => {
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "All Assignments";

        if (!items || items.length === 0) return [];

        let filtered = [...items];

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(item => {
                // For submissions (assignments to grade)
                if (isSubmission) {
                    return (
                        item.assignment.title.toLowerCase().includes(searchLower) ||
                        (item.assignment.description && item.assignment.description.toLowerCase().includes(searchLower)) ||
                        (item.assignment.course?.name && item.assignment.course.name.toLowerCase().includes(searchLower)) ||
                        (item.student?.name && item.student.name.toLowerCase().includes(searchLower))
                    );
                }

                // For regular assignments
                return (
                    item.title.toLowerCase().includes(searchLower) ||
                    (item.description && item.description.toLowerCase().includes(searchLower)) ||
                    (item.course?.name && item.course.name.toLowerCase().includes(searchLower))
                );
            });
        }

        // Apply category filter
        if (category !== "All Assignments") {
            switch (category) {
                case "Pending":
                    filtered = filtered.filter(a => {
                        if (isSubmission) return false; // Submissions aren't pending
                        return a.status === 'pending' || a.status === 'overdue' || a.status === 'submitted';
                    });
                    break;
                case "Completed":
                    filtered = filtered.filter(a => {
                        if (isSubmission) return false; // Submissions aren't completed
                        return a.status === 'completed';
                    });
                    break;
                case "To Grade":
                    // Only submissions are to grade
                    if (!isSubmission) return [];
                    break;
                case "Essays":
                    filtered = filtered.filter(a => {
                        if (isSubmission) return a.assignment.assignment_type === 'essay';
                        return a.assignment_type === 'essay';
                    });
                    break;
                case "Exercises":
                    filtered = filtered.filter(a => {
                        if (isSubmission) return a.assignment.assignment_type === 'exercise';
                        return a.assignment_type === 'exercise';
                    });
                    break;
                case "Recordings":
                    filtered = filtered.filter(a => {
                        if (isSubmission) return a.assignment.assignment_type === 'recording';
                        return a.assignment_type === 'recording';
                    });
                    break;
                case "Quizzes":
                    filtered = filtered.filter(a => {
                        if (isSubmission) return a.assignment.assignment_type === 'quiz';
                        return a.assignment_type === 'quiz';
                    });
                    break;
            }
        }

        return filtered;
    };

    // Apply filters when search params change
    useEffect(() => {
        setFilteredPending(applyFilters(pendingAssignments));
        setFilteredCompleted(applyFilters(completedAssignments));
        setFilteredToGrade(applyFilters(assignmentsToGrade, true));
    }, [searchParams, pendingAssignments, completedAssignments, assignmentsToGrade]);

    // Render pending assignment card
    const renderPendingCard = (assignment) => (
        <div
            key={assignment.id}
            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
        >
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${assignment.isOverdue
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                        }`}>
                        {assignment.isOverdue
                            ? "Overdue"
                            : assignment.assignment_type
                                ? assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)
                                : "Assignment"
                        }
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Due {assignment.dueDateDisplay}
                    </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>

                {assignment.files && assignment.files.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Assignment Files:</p>
                        <div className="max-h-28 overflow-y-auto">
                            {assignment.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                                    <span className="text-sm text-gray-600 truncate max-w-[70%]">{file.file_name}</span>
                                    <div className="flex items-center">
                                        <span className="text-xs text-gray-500 mr-2">{Math.round(file.file_size / 1024)} KB</span>
                                        <a
                                            href={file.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:text-primary-700"
                                        >
                                            <Download className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto space-y-4">
                    <div className="flex items-center text-sm text-gray-500 h-6">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {assignment.course?.name}
                    </div>

                    {assignment.submissionStats && (
                        <div className="bg-blue-50 p-3 rounded-md h-20 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {assignment.submissionStats.submittedStudents}/{assignment.submissionStats.totalStudents} Submitted
                                </p>
                                <p className="text-xs text-gray-500">
                                    {assignment.submissionStats.submissionRate}% submission rate
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-between px-6 pb-4 gap-2 mt-2">
                <Link
                    href={`/dashboard/assignments/${assignment.id}`}
                    className="btn btn-outline flex-1"
                >
                    View Details
                </Link>
                {!isTeacher && (
                    <Link
                        href={`/dashboard/assignments/${assignment.id}/submit`}
                        className="btn btn-primary flex items-center justify-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        <span>
                            Submit
                        </span>
                    </Link>
                )}
                {isTeacher && (
                    <Link
                        href={`/dashboard/assignments/${assignment.id}/edit`}
                        className="btn btn-primary"
                    >
                        Edit
                    </Link>
                )}
            </div>
        </div>
    );

    // Render completed assignment card
    const renderCompletedCard = (assignment) => (
        <div
            key={assignment.id}
            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
        >
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {assignment.status === 'completed' ? 'Graded' : 'Submitted'}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Due {assignment.dueDateDisplay}
                    </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center text-sm text-gray-500 h-6">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {assignment.course?.name}
                    </div>

                    {!isTeacher && assignment.submission?.grade !== null && (
                        <div className="bg-green-50 p-3 rounded-md h-16 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <Award className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Grade: {assignment.submission.grade}/{assignment.points}</p>
                                <p className="text-xs text-gray-500">
                                    {Math.round((assignment.submission.grade / assignment.points) * 100)}% Score
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">Points: {assignment.points}</span>
                        {assignment.isLate && (
                            <span className="text-amber-600 font-medium flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Submitted Late
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-between px-6 pb-4 gap-2 mt-2">
                <Link
                    href={`/dashboard/assignments/${assignment.id}`}
                    className="btn btn-outline flex-1"
                >
                    View Details
                </Link>
                {isTeacher && assignment.status !== 'completed' && (
                    <Link
                        href={`/dashboard/assignments/${assignment.id}/grade`}
                        className="btn btn-primary flex items-center justify-center gap-2 flex-1"
                    >
                        <CheckSquare className="w-4 h-4" />
                        <span>
                            Grade
                        </span>
                    </Link>
                )}
            </div>
        </div>
    );

    // Render assignment to grade card
    const renderToGradeCard = (submission) => (
        <div
            key={submission.id}
            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
        >
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                        Needs Grading
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy')}
                    </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{submission.assignment.title}</h3>

                {submission.files && submission.files.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Submission Files:</p>
                        <div className="max-h-28 overflow-y-auto">
                            {submission.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                                    <span className="text-sm text-gray-600 truncate max-w-[70%]">{file.file_name}</span>
                                    <span className="text-xs text-gray-500">{Math.round(file.file_size / 1024)} KB</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-auto space-y-4">
                    <div className="flex items-center text-sm text-gray-500 h-6">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {submission.assignment.course.name}
                    </div>

                    <div className="flex items-center h-12">
                        <div className="flex-shrink-0 mr-3">
                            <Avatar
                                url={submission.student.avatar}
                                name={submission.student.name}
                                size="sm"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{submission.student.name}</p>
                            <p className="text-xs text-gray-500">Student</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-between mt-2">
                <Link
                    href={`/dashboard/assignments/${submission.assignment.id}/submissions/${submission.id}/grade`}
                    className="btn btn-primary w-full"
                >
                    Grade Submission
                </Link>
            </div>
        </div>
    );

    // Render overview section for teachers
    const renderTeacherOverviewCard = (assignment) => (
        <div
            key={assignment.id}
            className="bg-white rounded-lg shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300 flex flex-col h-full"
        >
            <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {assignment.assignment_type
                            ? assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)
                            : "Assignment"
                        }
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Due {assignment.dueDateDisplay}
                    </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h3>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center text-sm text-gray-500 h-6">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {assignment.course?.name}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md flex items-center h-20">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            {assignment.submissionStats ? (
                                <>
                                    <p className="text-sm font-medium text-gray-900">
                                        {assignment.submissionStats.submittedStudents}/{assignment.submissionStats.totalStudents} Submitted
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {assignment.submissionStats.submissionRate}% submission rate
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-gray-900">0/0 Submitted</p>
                                    <p className="text-xs text-gray-500">No students enrolled</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between px-6 pb-4 gap-2 mt-2">
                <Link
                    href={`/dashboard/assignments/${assignment.id}`}
                    className="btn btn-outline flex-1"
                >
                    View Details
                </Link>
                <Link
                    href={`/dashboard/assignments/${assignment.id}/submissions`}
                    className="btn btn-primary"
                >
                    View Submissions
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Assignments to Grade Section (for teachers) */}
            {isTeacher && filteredToGrade.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Assignments to Grade</h2>
                        <Link href="/dashboard/submissions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                            View all <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredToGrade.map(renderToGradeCard)}
                    </div>
                </div>
            )}

            {/* Pending Assignments Section */}
            {filteredPending.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            {isTeacher ? "Created Assignments" : "Pending Assignments"}
                        </h2>
                        <Link
                            href={isTeacher ? "/dashboard/assignments/created" : "/dashboard/assignments/pending"}
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                        >
                            View all <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPending.map(renderPendingCard)}
                    </div>
                </div>
            )}

            {/* Completed Assignments Section (for students only) */}
            {!isTeacher && filteredCompleted.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Completed Assignments</h2>
                        <Link href="/dashboard/submissions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                            View all <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompleted.map(renderCompletedCard)}
                    </div>
                </div>
            )}

            {/* Assignment Submissions Overview for teachers */}
            {isTeacher && filteredPending.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Assignment Submissions Overview</h2>
                        <Link href="/dashboard/submissions" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                            View all <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredPending.slice(0, 3).map(renderTeacherOverviewCard)}
                    </div>
                </div>
            )}
        </>
    );
} 