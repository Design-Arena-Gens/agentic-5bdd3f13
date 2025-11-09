import Link from 'next/link';
import { Activity, Calendar, MessageSquare, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-700">FootCare Clinic</h1>
            <Link
              href="/portal"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              Client Portal
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Foot Health Assessment
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get instant professional guidance for your foot health concerns
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
          >
            <MessageSquare className="mr-2" size={24} />
            Start Your Assessment
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <Activity className="text-primary-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Diagnosis</h3>
            <p className="text-gray-600">
              Get preliminary diagnosis for common foot conditions using advanced AI
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <Calendar className="text-primary-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Book Appointments</h3>
            <p className="text-gray-600">
              Schedule appointments and follow-ups directly through the chatbot
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <MessageSquare className="text-primary-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Access our triage system anytime for immediate assistance
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <BarChart3 className="text-primary-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your treatment journey through our patient portal
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold mb-4">How It Works</h3>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                1
              </span>
              <div>
                <h4 className="font-semibold">Share Your Information</h4>
                <p className="text-gray-600">Provide your contact details and describe your foot issue</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                2
              </span>
              <div>
                <h4 className="font-semibold">AI Assessment</h4>
                <p className="text-gray-600">Our AI foot health practitioner analyzes your symptoms</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                3
              </span>
              <div>
                <h4 className="font-semibold">Book & Follow Up</h4>
                <p className="text-gray-600">Schedule appointments and receive follow-up reminders</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                4
              </span>
              <div>
                <h4 className="font-semibold">Share Feedback</h4>
                <p className="text-gray-600">Complete a satisfaction survey to help us improve</p>
              </div>
            </li>
          </ol>
        </div>
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            &copy; 2024 FootCare Clinic. AI-powered triage for better foot health.
          </p>
        </div>
      </footer>
    </div>
  );
}
