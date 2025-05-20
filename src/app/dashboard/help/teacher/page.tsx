import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Teacher Help & Documentation | LMS",
    description: "Comprehensive guide for LMS teachers",
}

export default async function TeacherHelpPage() {
    // Ensure only teachers can access this page
    const user = await requireServerAuth()
    if (user.role !== "TEACHER" && user.role !== "ADMIN") {
        redirect("/unauthorized")
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Teacher Help & Documentation</h1>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="prose max-w-none">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
                    <p>
                        Welcome to the Teacher Dashboard for the Learning Management System.
                        As a teacher, you can manage your classes, create and grade assignments,
                        schedule meetings with students, and track student progress.
                    </p>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="dashboard">Dashboard Overview</h2>
                        <p>
                            Your teacher dashboard provides you with:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Navigation Menu:</strong> Access to all teacher features</li>
                            <li><strong>Quick Stats:</strong> Overview of your classes, assignments, and upcoming meetings</li>
                            <li><strong>Recent Activity:</strong> Latest student submissions and interactions</li>
                            <li><strong>Notifications:</strong> Important alerts about new submissions, questions, and deadlines</li>
                        </ul>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="classes">Managing Your Classes</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Your Classes</h3>
                        <p>
                            To access your classes:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on "Classes" in the main navigation menu</li>
                            <li>You'll see a grid of all classes you teach</li>
                            <li>Each class card displays:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Class name</li>
                                    <li>Number of enrolled students</li>
                                    <li>Active assignments count</li>
                                    <li>Next scheduled meeting (if any)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Class Details</h3>
                        <p>
                            To view detailed information about a class:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on a class card from your Classes page</li>
                            <li>The class details page includes:
                                <ul className="list-disc pl-6 mt-1">
                                    <li><strong>Overview Tab:</strong> Class description, schedule, and key metrics</li>
                                    <li><strong>Students Tab:</strong> List of enrolled students with progress indicators</li>
                                    <li><strong>Assignments Tab:</strong> All assignments for this class with submission stats</li>
                                    <li><strong>Meetings Tab:</strong> Scheduled and past meetings</li>
                                    <li><strong>Materials Tab:</strong> Uploaded resources and materials</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Student Progress</h3>
                        <p>
                            To track individual student progress:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>From the class details page, click on the "Students" tab</li>
                            <li>Click on a student's name to view their detailed profile</li>
                            <li>The student profile shows:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Assignment completion rate</li>
                                    <li>Average grades</li>
                                    <li>Attendance record</li>
                                    <li>Recent activity and submissions</li>
                                </ul>
                            </li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="assignments">Creating and Managing Assignments</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Assignments</h3>
                        <p>
                            To access all your assignments:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on "Assignments" in the main navigation menu</li>
                            <li>You'll see a list of all assignments you've created</li>
                            <li>You can filter assignments by:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Class</li>
                                    <li>Status (Active, Past, Draft)</li>
                                    <li>Type (Exercise, Essay, Quiz, etc.)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Creating a New Assignment</h3>
                        <p>
                            To create a new assignment:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click the "Create Assignment" button on the Assignments page</li>
                            <li>Fill in the assignment details:
                                <ul className="list-disc pl-6 mt-1">
                                    <li><strong>Title:</strong> Enter a descriptive name</li>
                                    <li><strong>Description:</strong> Provide detailed instructions using the rich text editor</li>
                                    <li><strong>Class:</strong> Select which class this assignment is for</li>
                                    <li><strong>Due Date:</strong> Set the submission deadline</li>
                                    <li><strong>Points:</strong> Specify the maximum points possible</li>
                                    <li><strong>Assignment Type:</strong> Choose from Exercise, Essay, Quiz, etc.</li>
                                </ul>
                            </li>
                            <li>Optionally attach files by clicking "Add Files"</li>
                            <li>Click "Create Assignment" to publish it to students</li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Submissions</h3>
                        <p>
                            To view and grade student submissions:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>From the Assignments page, click on an assignment name</li>
                            <li>Click the "Submissions" tab to see all student submissions</li>
                            <li>The submissions list shows:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Student name</li>
                                    <li>Submission date</li>
                                    <li>Status (Submitted, Graded)</li>
                                    <li>Grade (if already graded)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Grading Submissions</h3>
                        <p>
                            To grade a student's submission:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on a student's name in the submissions list</li>
                            <li>Review their submission content and any attached files</li>
                            <li>Enter a grade in the "Points" field (out of the maximum points)</li>
                            <li>Provide feedback in the "Feedback" text area</li>
                            <li>Click "Save Grade" to finalize</li>
                        </ol>
                        <p className="mt-2 text-sm text-gray-600">
                            <strong>Note:</strong> Once a submission is graded, the student will be notified
                            and can view their grade and your feedback.
                        </p>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="meetings">Scheduling and Managing Meetings</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Meetings</h3>
                        <p>
                            To access your scheduled meetings:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on "Meetings" in the main navigation menu</li>
                            <li>You'll see a list of all upcoming and past meetings</li>
                            <li>You can switch between list view and calendar view using the tabs</li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Creating a New Meeting</h3>
                        <p>
                            To schedule a new meeting:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click the "Create Meeting" button on the Meetings page</li>
                            <li>Fill in the meeting details:
                                <ul className="list-disc pl-6 mt-1">
                                    <li><strong>Title:</strong> Enter a descriptive name</li>
                                    <li><strong>Description:</strong> Provide details about the meeting purpose</li>
                                    <li><strong>Class:</strong> Select which class this meeting is for</li>
                                    <li><strong>Date and Time:</strong> Set the start time</li>
                                    <li><strong>Duration:</strong> Specify how long the meeting will last</li>
                                    <li><strong>Meeting Type:</strong> Choose from Regular Class, Office Hours, Review Session, etc.</li>
                                </ul>
                            </li>
                            <li>Optionally add a meeting link if it's an online meeting</li>
                            <li>Click "Schedule Meeting" to create and notify students</li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Managing Meeting Attendance</h3>
                        <p>
                            To track attendance for a meeting:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>From the Meetings page, click on a meeting name</li>
                            <li>Click the "Attendance" tab</li>
                            <li>You'll see a list of all students in the class</li>
                            <li>Mark each student as Present, Absent, or Excused</li>
                            <li>Optionally add notes for individual students</li>
                            <li>Click "Save Attendance" when complete</li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="notifications">Managing Notifications</h2>
                        <p>
                            The notification system helps you stay updated on important events:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>New Submissions:</strong> Alerts when students submit assignments</li>
                            <li><strong>Questions:</strong> Notifications when students ask questions on assignments</li>
                            <li><strong>Approaching Deadlines:</strong> Reminders about upcoming due dates</li>
                            <li><strong>Meeting Reminders:</strong> Alerts about scheduled meetings</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Notification Preferences</h3>
                        <p>
                            To customize your notification settings:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on your profile picture in the top-right corner</li>
                            <li>Select "Profile" from the dropdown menu</li>
                            <li>Click the "Notifications" tab</li>
                            <li>Configure which notifications you want to receive:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>In-app notifications</li>
                                    <li>Email notifications</li>
                                    <li>Frequency of digest emails</li>
                                </ul>
                            </li>
                            <li>Click "Save Preferences" to apply changes</li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="best-practices">Teaching Best Practices</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Assignment Creation</h3>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Clear Instructions:</strong> Provide detailed, step-by-step instructions for all assignments</li>
                            <li><strong>Varied Types:</strong> Mix different assignment types to maintain student engagement</li>
                            <li><strong>Reasonable Deadlines:</strong> Set due dates that give students sufficient time to complete work</li>
                            <li><strong>Scaffolded Learning:</strong> Structure assignments to build on previous knowledge</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Effective Feedback</h3>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Timely Grading:</strong> Aim to grade submissions within 3-5 days</li>
                            <li><strong>Constructive Comments:</strong> Balance praise with specific areas for improvement</li>
                            <li><strong>Rubric Use:</strong> Reference assignment criteria when explaining grades</li>
                            <li><strong>Personalized Feedback:</strong> Address each student's specific strengths and challenges</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Student Engagement</h3>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Regular Check-ins:</strong> Schedule periodic one-on-one meetings with students</li>
                            <li><strong>Prompt Responses:</strong> Answer student questions within 24 hours when possible</li>
                            <li><strong>Progress Monitoring:</strong> Regularly review student performance data</li>
                            <li><strong>Proactive Outreach:</strong> Contact students who are falling behind or missing assignments</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Reference</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Class Management</h3>
                        <ul className="list-disc pl-4 text-sm">
                            <li><Link href="#classes" className="text-primary-600 hover:text-primary-800">Managing Classes</Link></li>
                            <li><Link href="/dashboard/classes" className="text-primary-600 hover:text-primary-800">View Your Classes</Link></li>
                        </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Assignments</h3>
                        <ul className="list-disc pl-4 text-sm">
                            <li><Link href="#assignments" className="text-primary-600 hover:text-primary-800">Creating Assignments</Link></li>
                            <li><Link href="/dashboard/assignments/create" className="text-primary-600 hover:text-primary-800">New Assignment</Link></li>
                            <li><Link href="/dashboard/assignments" className="text-primary-600 hover:text-primary-800">View All Assignments</Link></li>
                        </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Meetings</h3>
                        <ul className="list-disc pl-4 text-sm">
                            <li><Link href="#meetings" className="text-primary-600 hover:text-primary-800">Scheduling Meetings</Link></li>
                            <li><Link href="/dashboard/meetings/create" className="text-primary-600 hover:text-primary-800">New Meeting</Link></li>
                            <li><Link href="/dashboard/meetings" className="text-primary-600 hover:text-primary-800">View All Meetings</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
} 