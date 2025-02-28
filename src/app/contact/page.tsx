import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, ChevronDown } from 'lucide-react'
import { Metadata } from "next"
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
    title: "Contact Us | English Learning Center",
    description: "Get in touch with our team",
}

export default function ContactPage() {
    return (
        <div className="min-h-screen py-12 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We&apos;re here to help. Reach out to our team using any of the methods below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-card p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="p-2 rounded-md bg-primary-50 text-primary-600 mr-4">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                                    <p className="text-gray-600">support@lmsplatform.com</p>
                                    <p className="text-gray-600">info@lmsplatform.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="p-2 rounded-md bg-green-50 text-green-600 mr-4">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                                    <p className="text-gray-600">+1 (555) 123-4567</p>
                                    <p className="text-gray-600">+1 (555) 987-6543</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="p-2 rounded-md bg-yellow-50 text-yellow-600 mr-4">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Address</h3>
                                    <p className="text-gray-600">
                                        123 Education Street<br />
                                        Learning City, LC 12345<br />
                                        United States
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="p-2 rounded-md bg-red-50 text-red-600 mr-4">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">Hours</h3>
                                    <p className="text-gray-600">Monday - Friday: 9AM - 5PM</p>
                                    <p className="text-gray-600">Saturday: 10AM - 2PM</p>
                                    <p className="text-gray-600">Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-lg shadow-card p-6 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>
                        <ContactForm />
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-lg shadow-card p-6 mb-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
                        <p className="text-gray-600">
                            Find quick answers to common questions about our platform
                        </p>
                    </div>

                    <div className="space-y-4 max-w-3xl mx-auto">
                        {[
                            {
                                question: "How do I reset my password?",
                                answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. You will receive an email with instructions to create a new password."
                            },
                            {
                                question: "Can I access the platform on mobile devices?",
                                answer: "Yes, our platform is fully responsive and works on all devices including smartphones and tablets. You can access all features on the go."
                            },
                            {
                                question: "How do I enroll in a course?",
                                answer: "After logging in, navigate to the course catalog, find the course you're interested in, and click the 'Enroll' button. Some courses may require approval or payment before enrollment is complete."
                            },
                            {
                                question: "What payment methods do you accept?",
                                answer: "We accept all major credit cards, PayPal, and bank transfers for premium courses and subscriptions. Payment information is securely processed and stored."
                            },
                            {
                                question: "How can I get technical support?",
                                answer: "For technical issues, you can contact our support team via email at support@lmsplatform.com or use the live chat feature available on the dashboard when logged in."
                            }
                        ].map((faq, index) => (
                            <details key={index} className="group border border-gray-200 rounded-lg">
                                <summary className="flex justify-between items-center cursor-pointer p-4 text-gray-900 font-medium">
                                    {faq.question}
                                    <ChevronDown className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Map and Directions */}
                <div className="bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Visit Our Office</h2>
                    <div className="aspect-w-16 aspect-h-9 mb-6">
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-400 mr-2" />
                            <span className="text-gray-500">Interactive Map Placeholder</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Getting Here</h3>
                        <p className="text-gray-600 mb-4">
                            Our office is conveniently located in downtown Learning City, with easy access to public transportation and parking facilities.
                        </p>
                        <Link href="https://maps.google.com" target="_blank" className="btn btn-outline">
                            Get Directions
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
} 