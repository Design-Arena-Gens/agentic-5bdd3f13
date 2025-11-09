'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Users, TrendingUp, Calendar, MessageSquare, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface Session {
  id: string;
  patient_id: string;
  issue_category: string;
  symptoms: string;
  diagnosis: string;
  appointment_date?: string;
  follow_up_date?: string;
  satisfaction_score?: number;
  satisfaction_feedback?: string;
  status: string;
  created_at: string;
}

interface Analytics {
  totalPatients: number;
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  avgSatisfaction: number;
  issueCategories: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function PortalPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'sessions'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patientsRes, sessionsRes, analyticsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/sessions'),
        fetch('/api/analytics'),
      ]);

      if (patientsRes.ok) {
        const data = await patientsRes.json();
        setPatients(data.patients || []);
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.sessions || []);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const issueChartData = analytics
    ? Object.entries(analytics.issueCategories).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center text-primary-600 hover:text-primary-800">
              <ArrowLeft className="mr-2" size={20} />
              Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-primary-700">Client Portal</h1>
            <Link
              href="/chat"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              New Assessment
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'patients'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Patients
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'sessions'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sessions
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-3xl font-bold text-primary-700">{analytics.totalPatients}</p>
                  </div>
                  <Users className="text-primary-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-3xl font-bold text-primary-700">{analytics.totalSessions}</p>
                  </div>
                  <MessageSquare className="text-primary-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Sessions</p>
                    <p className="text-3xl font-bold text-green-600">{analytics.activeSessions}</p>
                  </div>
                  <Activity className="text-green-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-3xl font-bold text-blue-600">{analytics.completedSessions}</p>
                  </div>
                  <TrendingUp className="text-blue-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Satisfaction</p>
                    <p className="text-3xl font-bold text-yellow-600">{analytics.avgSatisfaction.toFixed(1)}</p>
                  </div>
                  <Star className="text-yellow-600" size={32} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Issue Categories</h3>
                {issueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={issueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0284c7" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">No data available yet</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Issue Distribution</h3>
                {issueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={issueChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {issueChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">No data available yet</p>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
              {sessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Patient</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Issue</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Satisfaction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sessions.slice(0, 10).map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{getPatientName(session.patient_id)}</td>
                          <td className="px-4 py-3 text-sm">{session.issue_category}</td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                session.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : session.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {session.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">{formatDate(session.created_at)}</td>
                          <td className="px-4 py-3 text-sm">
                            {session.satisfaction_score ? (
                              <span className="flex items-center">
                                <Star className="text-yellow-500 mr-1" size={16} />
                                {session.satisfaction_score}/5
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No sessions yet. Start a new assessment to get started.</p>
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Patients List</h3>
              {patients.length > 0 ? (
                <div className="space-y-2">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-primary-100 border border-primary-300'
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No patients yet</p>
              )}
            </div>

            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              {selectedPatient ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Patient Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedPatient.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Registered</label>
                      <p className="text-gray-900">{formatDate(selectedPatient.created_at)}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Sessions</h4>
                      {sessions.filter(s => s.patient_id === selectedPatient.id).length > 0 ? (
                        <div className="space-y-2">
                          {sessions
                            .filter(s => s.patient_id === selectedPatient.id)
                            .map((session) => (
                              <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{session.issue_category}</p>
                                    <p className="text-sm text-gray-600">{formatDate(session.created_at)}</p>
                                  </div>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      session.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : session.status === 'scheduled'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                                  >
                                    {session.status}
                                  </span>
                                </div>
                                {session.appointment_date && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    <Calendar className="inline mr-1" size={14} />
                                    Appointment: {formatDateTime(session.appointment_date)}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No sessions yet</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">Select a patient to view details</p>
              )}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Sessions List</h3>
              {sessions.length > 0 ? (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedSession?.id === session.id
                          ? 'bg-primary-100 border border-primary-300'
                          : 'hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className="font-medium">{session.issue_category}</p>
                      <p className="text-sm text-gray-600">{getPatientName(session.patient_id)}</p>
                      <p className="text-xs text-gray-500">{formatDate(session.created_at)}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No sessions yet</p>
              )}
            </div>

            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              {selectedSession ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Session Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Patient</label>
                      <p className="text-gray-900">{getPatientName(selectedSession.patient_id)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Issue Category</label>
                      <p className="text-gray-900">{selectedSession.issue_category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          selectedSession.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : selectedSession.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {selectedSession.status}
                      </span>
                    </div>
                    {selectedSession.symptoms && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Symptoms</label>
                        <p className="text-gray-900">{selectedSession.symptoms}</p>
                      </div>
                    )}
                    {selectedSession.appointment_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Appointment</label>
                        <p className="text-gray-900">{formatDateTime(selectedSession.appointment_date)}</p>
                      </div>
                    )}
                    {selectedSession.follow_up_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Follow-up</label>
                        <p className="text-gray-900">{formatDateTime(selectedSession.follow_up_date)}</p>
                      </div>
                    )}
                    {selectedSession.satisfaction_score && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Satisfaction</label>
                        <p className="text-gray-900 flex items-center">
                          <Star className="text-yellow-500 mr-1" size={16} />
                          {selectedSession.satisfaction_score}/5
                        </p>
                      </div>
                    )}
                    {selectedSession.satisfaction_feedback && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Feedback</label>
                        <p className="text-gray-900">{selectedSession.satisfaction_feedback}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-700">Created</label>
                      <p className="text-gray-900">{formatDateTime(selectedSession.created_at)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">Select a session to view details</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
