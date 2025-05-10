import { Metadata } from "next"
import { requireServerAuth } from "@/lib/actions"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Student Help & Documentation | LMS",
    description: "Comprehensive guide for LMS students",
}

export default async function StudentHelpPage() {
    // Ensure users can access this page (students or higher roles)
    const user = await requireServerAuth()

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Help & Documentation</h1>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="prose max-w-none">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Getting Started</h2>
                    <p>
                        Welcome to the Student Dashboard for the Learning Management System.
                        As a student, you can access your classes, complete assignments,
                        attend scheduled meetings, and track your academic progress.
                    </p>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="dashboard">Dashboard Overview</h2>
                        <p>
                            Your student dashboard provides you with:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Navigation Menu:</strong> Quick access to all student features</li>
                            <li><strong>Upcoming Assignments:</strong> View assignments due soon</li>
                            <li><strong>Scheduled Meetings:</strong> See your upcoming class meetings</li>
                            <li><strong>Recent Grades:</strong> Check your latest graded assignments</li>
                            <li><strong>Notifications:</strong> Important alerts about new assignments, grades, and meetings</li>
                        </ul>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="classes">Your Classes</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Your Classes</h3>
                        <p>
                            To access your enrolled classes:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on "Classes" in the main navigation menu</li>
                            <li>You'll see a grid of all classes you're enrolled in</li>
                            <li>Each class card displays:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Class name</li>
                                    <li>Teacher name</li>
                                    <li>Pending assignments count</li>
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
                                    <li><strong>Overview Tab:</strong> Class description, schedule, and teacher information</li>
                                    <li><strong>Assignments Tab:</strong> All assignments for this class with their due dates and status</li>
                                    <li><strong>Meetings Tab:</strong> Scheduled and past meetings</li>
                                    <li><strong>Materials Tab:</strong> Resources and materials shared by your teacher</li>
                                    <li><strong>Progress Tab:</strong> Your performance metrics for this class</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Classmates</h3>
                        <p>
                            To view other students in your class:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>From the class details page, click on the "Classmates" tab</li>
                            <li>You'll see a list of all students enrolled in the class</li>
                            <li>This can be helpful for forming study groups or collaborative projects</li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="assignments">Assignments</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Assignments</h3>
                        <p>
                            To access all your assignments:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on "Assignments" in the main navigation menu</li>
                            <li>You'll see a list of all your assignments across all classes</li>
                            <li>You can filter assignments by:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Class</li>
                                    <li>Status (Pending, Completed, Overdue)</li>
                                    <li>Type (Exercise, Essay, Quiz, etc.)</li>
                                </ul>
                            </li>
                            <li>Each assignment shows:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Title and brief description</li>
                                    <li>Due date</li>
                                    <li>Status</li>
                                    <li>Points possible</li>
                                    <li>Grade (if completed and graded)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Assignment Details</h3>
                        <p>
                            To view detailed information about an assignment:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on an assignment title from the assignments list</li>
                            <li>The assignment details page includes:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Full assignment description and instructions</li>
                                    <li>Any attached files or resources from your teacher</li>
                                    <li>Due date and time remaining</li>
                                    <li>Submission status</li>
                                    <li>Grade and feedback (if already graded)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Submitting Assignments</h3>
                        <p>
                            To submit an assignment:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>From the assignment details page, click the "Submit Assignment" button</li>
                            <li>Complete the submission form:
                                <ul className="list-disc pl-6 mt-1">
                                    <li><strong>Content:</strong> Type your response in the text editor (for text-based assignments)</li>
                                    <li><strong>Files:</strong> Upload any required files by clicking "Add Files"</li>
                                    <li><strong>Notes:</strong> Optionally add notes to your teacher</li>
                                </ul>
                            </li>
                            <li>Review your submission carefully</li>
                            <li>Click "Submit" to finalize</li>
                        </ol>
                        <p className="mt-2 text-sm text-gray-600">
                            <strong>Note:</strong> Most assignments can be resubmitted until the due date.
                            Check with your teacher about specific resubmission policies.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Grades and Feedback</h3>
                        <p>
                            After your assignment has been graded:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>You'll receive a notification when grading is complete</li>
                            <li>Access the assignment details page to view:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Your grade</li>
                                    <li>Detailed feedback from your teacher</li>
                                    <li>Any annotations on your submitted work</li>
                                </ul>
                            </li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="meetings">Meetings</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Viewing Scheduled Meetings</h3>
                        <p>
                            To access your scheduled meetings:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on "Meetings" in the main navigation menu</li>
                            <li>You'll see a list of all upcoming and past meetings</li>
                            <li>You can switch between list view and calendar view using the tabs</li>
                            <li>Each meeting shows:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Title and description</li>
                                    <li>Date and time</li>
                                    <li>Duration</li>
                                    <li>Associated class</li>
                                    <li>Meeting type (Class Session, Office Hours, etc.)</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Joining Online Meetings</h3>
                        <p>
                            For online meetings:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Open the meeting details by clicking on the meeting title</li>
                            <li>Click the "Join Meeting" button when it's time for the meeting</li>
                            <li>This will open the meeting link in a new tab or your designated meeting application</li>
                            <li>Ensure your camera and microphone are properly set up before joining</li>
                        </ol>
                        <p className="mt-2 text-sm text-gray-600">
                            <strong>Tip:</strong> Join a few minutes early to test your audio and video setup.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Meeting Materials</h3>
                        <p>
                            To access materials related to a meeting:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Open the meeting details page</li>
                            <li>Check the "Materials" section for any files shared by your teacher</li>
                            <li>These might include slides, handouts, or other resources for the session</li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="progress">Tracking Your Progress</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Progress Overview</h3>
                        <p>
                            To view your overall academic progress:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Click on your profile picture in the top-right corner</li>
                            <li>Select "My Progress" from the dropdown menu</li>
                            <li>The progress dashboard shows:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Overall grade average across all classes</li>
                                    <li>Assignment completion rate</li>
                                    <li>Meeting attendance record</li>
                                    <li>Progress charts showing improvement over time</li>
                                </ul>
                            </li>
                        </ol>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Class-Specific Progress</h3>
                        <p>
                            To view your progress in a specific class:
                        </p>
                        <ol className="list-decimal pl-6 mt-2 space-y-2">
                            <li>Navigate to the class details page</li>
                            <li>Click on the "Progress" tab</li>
                            <li>You'll see detailed metrics about your performance in that class:
                                <ul className="list-disc pl-6 mt-1">
                                    <li>Current grade</li>
                                    <li>Assignment grades breakdown</li>
                                    <li>Completed vs. pending assignments</li>
                                    <li>Attendance record</li>
                                </ul>
                            </li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="notifications">Managing Notifications</h2>
                        <p>
                            The notification system helps you stay updated on important events:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>New Assignments:</strong> Alerts when teachers post new assignments</li>
                            <li><strong>Grades:</strong> Notifications when your work has been graded</li>
                            <li><strong>Approaching Deadlines:</strong> Reminders about upcoming due dates</li>
                            <li><strong>Meeting Notifications:</strong> Alerts about scheduled meetings</li>
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
                                    <li>Reminder timing (how soon before deadlines)</li>
                                </ul>
                            </li>
                            <li>Click "Save Preferences" to apply changes</li>
                        </ol>
                    </div>

                    <div className="my-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4" id="best-practices">Student Success Tips</h2>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Assignment Management</h3>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Check Assignments Daily:</strong> Make it a habit to review your pending assignments</li>
                            <li><strong>Plan Ahead:</strong> Create a schedule for completing assignments before deadlines</li>
                            <li><strong>Start Early:</strong> Begin working on assignments as soon as they're assigned</li>
                            <li><strong>Save Drafts:</strong> Regularly save your work as you progress</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Effective Participation</h3>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Prepare for Meetings:</strong> Review relevant materials before class sessions</li>
                            <li><strong>Active Engagement:</strong> Participate in discussions and ask questions</li>
                            <li><strong>Take Notes:</strong> Record important points during meetings</li>
                            <li><strong>Utilize Office Hours:</strong> Schedule time with your teacher if you need help</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-700 mt-4 mb-2">Technical Preparation</h3>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Check Connectivity:</strong> Ensure you have reliable internet for online meetings</li>
                            <li><strong>Update Your Browser:</strong> Keep your web browser updated for optimal platform performance</li>
                            <li><strong>File Management:</strong> Organize your downloaded resources in dedicated folders</li>
                            <li><strong>Backup Work:</strong> Save important assignments in multiple locations</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Reference</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Classes</h3>
                        <ul className="list-disc pl-4 text-sm">
                            <li><Link href="#classes" className="text-primary-600 hover:text-primary-800">Your Classes</Link></li>
                            <li><Link href="/dashboard/classes" className="text-primary-600 hover:text-primary-800">View All Classes</Link></li>
                        </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Assignments</h3>
                        <ul className="list-disc pl-4 text-sm">
                            <li><Link href="#assignments" className="text-primary-600 hover:text-primary-800">Working with Assignments</Link></li>
                            <li><Link href="/dashboard/assignments" className="text-primary-600 hover:text-primary-800">View All Assignments</Link></li>
                        </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Meetings</h3>
                        <ul className="list-disc pl-4 text-sm">
                            <li><Link href="#meetings" className="text-primary-600 hover:text-primary-800">Attending Meetings</Link></li>
                            <li><Link href="/dashboard/meetings" className="text-primary-600 hover:text-primary-800">View All Meetings</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
} 