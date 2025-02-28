import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  MessageSquare,
  Shield
} from 'lucide-react'

export const metadata: Metadata = {
  title: "Learning Management System",
  description: "A modern platform for online education",
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Empower Your Learning Journey
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                A comprehensive learning management system designed to enhance your educational experience with intuitive tools and resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup" className="btn btn-primary">
                  Get Started
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-card">
                <Image
                  src="/images/hero-image.jpg"
                  alt="Students learning online"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Effective Learning
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and features to make your learning experience seamless and productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="p-3 rounded-md bg-primary-50 text-primary-600 w-fit mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Comprehensive Courses
              </h3>
              <p className="text-gray-600">
                Access a wide range of courses with structured content, interactive materials, and assessments.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="p-3 rounded-md bg-yellow-50 text-yellow-600 w-fit mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Schedule Management
              </h3>
              <p className="text-gray-600">
                Keep track of classes, assignments, and deadlines with our intuitive calendar system.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="p-3 rounded-md bg-green-50 text-green-600 w-fit mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Collaborative Learning
              </h3>
              <p className="text-gray-600">
                Connect with peers and instructors through discussion forums, group projects, and virtual meetings.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="p-3 rounded-md bg-red-50 text-red-600 w-fit mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Progress Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your learning progress with detailed analytics, achievements, and performance metrics.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="p-3 rounded-md bg-purple-50 text-purple-600 w-fit mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Instant Feedback
              </h3>
              <p className="text-gray-600">
                Receive timely feedback on assignments and assessments to improve your understanding.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="p-3 rounded-md bg-blue-50 text-blue-600 w-fit mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure Platform
              </h3>
              <p className="text-gray-600">
                Your data and privacy are protected with our secure infrastructure and compliance measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from students and educators who have transformed their learning experience with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-semibold mr-4">
                  S
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Computer Science Student</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;This platform has completely transformed how I approach my studies. The organized course structure and interactive tools have made learning more engaging and effective.&quot;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-semibold mr-4">
                  M
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Michael Chen</h4>
                  <p className="text-sm text-gray-500">Mathematics Professor</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;As an educator, I&apos;ve found this LMS to be incredibly intuitive. It allows me to create engaging content and track student progress effectively, making teaching more impactful.&quot;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-semibold mr-4">
                  A
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Aisha Patel</h4>
                  <p className="text-sm text-gray-500">Business Administration Student</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;The collaborative features have been a game-changer for my group projects. Being able to communicate and share resources seamlessly has improved our teamwork significantly.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <p className="text-gray-600">Expert Instructors</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">1,200+</div>
              <p className="text-gray-600">Courses Available</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">95%</div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 md:p-12 rounded-lg shadow-card text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Join thousands of students and educators who are already benefiting from our comprehensive learning platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup" className="btn btn-primary">
                Sign Up Now
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
