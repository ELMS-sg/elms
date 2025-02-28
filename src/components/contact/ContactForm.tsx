"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Send } from 'lucide-react'

export default function ContactForm() {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // For demo purposes, we'll just log the form data and show success
            console.log('Form submitted:', formState)

            // Reset form
            setFormState({
                name: '',
                email: '',
                subject: '',
                message: '',
            })
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Your name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="Your email"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                </label>
                <select
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    className="input w-full"
                >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feedback">Feedback</option>
                </select>
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    rows={5}
                    className="input w-full"
                    placeholder="Your message"
                    required
                ></textarea>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="privacy"
                    name="privacy"
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    required
                />
                <label htmlFor="privacy" className="ml-2 block text-sm text-gray-600">
                    I agree to the <Link href="/privacy" className="text-primary-600 hover:text-primary-700">privacy policy</Link>
                </label>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full md:w-auto flex items-center justify-center"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                    </>
                ) : (
                    <>
                        Send Message
                        <Send className="ml-2 w-4 h-4" />
                    </>
                )}
            </button>
        </form>
    )
}