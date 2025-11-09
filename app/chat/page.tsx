'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState({ name: '', email: '', phone: '' });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    const greeting: Message = {
      role: 'assistant',
      content: "Hello! I'm your AI Foot Health Assistant at FootCare Clinic. I'm here to help assess your foot concerns and guide you through our services.\n\nTo get started, may I have your full name?",
    };
    setMessages([greeting]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const extractPatientInfo = (msgs: Message[]) => {
    const userMessages = msgs.filter(m => m.role === 'user').map(m => m.content);

    if (userMessages.length >= 1 && !patientInfo.name) {
      setPatientInfo(prev => ({ ...prev, name: userMessages[0] }));
    }
    if (userMessages.length >= 2 && !patientInfo.email) {
      setPatientInfo(prev => ({ ...prev, email: userMessages[1] }));
    }
    if (userMessages.length >= 3 && !patientInfo.phone) {
      setPatientInfo(prev => ({ ...prev, phone: userMessages[2] }));

      // Create patient after collecting all info
      createPatient(userMessages[0], userMessages[1], userMessages[2]);
    }
  };

  const createPatient = async (name: string, email: string, phone: string) => {
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });

      if (res.ok) {
        const data = await res.json();
        setPatientId(data.patient.id);

        // Create session
        const sessionRes = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: data.patient.id,
            issueCategory: 'general',
            symptoms: '',
          }),
        });

        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSessionId(sessionData.session.id);
        }
      }
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const detectIssueCategory = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('ingrown') || lower.includes('toenail')) return 'Ingrown Toenail';
    if (lower.includes('heel') || lower.includes('plantar')) return 'Heel Pain / Plantar Fasciitis';
    if (lower.includes('athlete') || lower.includes('fungus') || lower.includes('itch')) return 'Athlete\'s Foot / Fungal Infection';
    if (lower.includes('bunion')) return 'Bunions';
    return 'General Foot Issue';
  };

  const detectAppointment = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes('tomorrow')) return new Date(Date.now() + 86400000).toISOString();
    if (lower.includes('wednesday')) {
      const next = new Date();
      next.setDate(next.getDate() + ((3 - next.getDay() + 7) % 7 || 7));
      return next.toISOString();
    }
    if (lower.includes('thursday')) {
      const next = new Date();
      next.setDate(next.getDate() + ((4 - next.getDay() + 7) % 7 || 7));
      return next.toISOString();
    }
    if (lower.includes('friday')) {
      const next = new Date();
      next.setDate(next.getDate() + ((5 - next.getDay() + 7) % 7 || 7));
      return next.toISOString();
    }
    return null;
  };

  const detectSatisfaction = (message: string): number | null => {
    const match = message.match(/[1-5]/);
    return match ? parseInt(match[0]) : null;
  };

  const updateSessionData = async (userMessage: string) => {
    if (!sessionId) return;

    const updates: any = {};

    // Detect issue category (around message 5)
    if (messages.filter(m => m.role === 'user').length === 4) {
      updates.issue_category = detectIssueCategory(userMessage);
      updates.symptoms = userMessage;
    }

    // Detect appointment booking
    const appointmentDate = detectAppointment(userMessage);
    if (appointmentDate) {
      updates.appointment_date = appointmentDate;
      updates.status = 'scheduled';
    }

    // Detect follow-up
    if (userMessage.toLowerCase().includes('yes') && messages.length >= 18) {
      const followUpDate = new Date(Date.now() + 14 * 86400000).toISOString();
      updates.follow_up_date = followUpDate;
    }

    // Detect satisfaction rating
    const rating = detectSatisfaction(userMessage);
    if (rating) {
      updates.satisfaction_score = rating;
    }

    // Detect satisfaction feedback
    if (messages.filter(m => m.role === 'user').length >= 11 && !userMessage.match(/[1-5]/)) {
      updates.satisfaction_feedback = userMessage;
      updates.status = 'completed';
    }

    if (Object.keys(updates).length > 0) {
      try {
        await fetch('/api/sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, updates }),
        });
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Extract patient info
    extractPatientInfo(newMessages);

    // Update session data based on user message
    await updateSessionData(input);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          sessionId,
          patientId,
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      setIsDemoMode(data.isDemoMode);

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center text-primary-600 hover:text-primary-800">
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold text-primary-700">FootCare Triage Assistant</h1>
            {sessionId && (
              <Link
                href={`/portal?session=${sessionId}`}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                View Portal
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isDemoMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Demo Mode:</strong> Running with simulated AI responses. Set OPENAI_API_KEY environment variable for real AI diagnosis.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="chat-container overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
              >
                <div
                  className={`message-bubble rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <Loader2 className="animate-spin text-primary-600" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-primary-600 text-white rounded-lg px-6 py-2 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {patientInfo.name && (
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Session Info</h3>
            <p className="text-sm text-gray-600">Patient: {patientInfo.name}</p>
            {patientInfo.email && <p className="text-sm text-gray-600">Email: {patientInfo.email}</p>}
            {sessionId && <p className="text-sm text-gray-600">Session ID: {sessionId}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
