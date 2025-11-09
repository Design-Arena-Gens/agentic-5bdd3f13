// Mock database for demo purposes (replaces Supabase)
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Session {
  id: string;
  patient_id: string;
  issue_category: string;
  symptoms: string;
  diagnosis: string;
  conversation: any[];
  appointment_date?: string;
  follow_up_date?: string;
  satisfaction_score?: number;
  satisfaction_feedback?: string;
  status: 'active' | 'completed' | 'scheduled';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

class MockDatabase {
  private patients: Map<string, Patient> = new Map();
  private sessions: Map<string, Session> = new Map();
  private messages: Map<string, Message> = new Map();

  // Patient methods
  createPatient(data: Omit<Patient, 'id' | 'created_at'>): Patient {
    const patient: Patient = {
      id: this.generateId(),
      ...data,
      created_at: new Date().toISOString(),
    };
    this.patients.set(patient.id, patient);
    return patient;
  }

  getPatient(id: string): Patient | null {
    return this.patients.get(id) || null;
  }

  getAllPatients(): Patient[] {
    return Array.from(this.patients.values());
  }

  // Session methods
  createSession(data: Omit<Session, 'id' | 'created_at' | 'updated_at'>): Session {
    const session: Session = {
      id: this.generateId(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  getSession(id: string): Session | null {
    return this.sessions.get(id) || null;
  }

  updateSession(id: string, updates: Partial<Session>): Session | null {
    const session = this.sessions.get(id);
    if (!session) return null;

    const updatedSession = {
      ...session,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  getSessionsByPatient(patientId: string): Session[] {
    return Array.from(this.sessions.values())
      .filter(s => s.patient_id === patientId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Message methods
  createMessage(data: Omit<Message, 'id' | 'created_at'>): Message {
    const message: Message = {
      id: this.generateId(),
      ...data,
      created_at: new Date().toISOString(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  getMessagesBySession(sessionId: string): Message[] {
    return Array.from(this.messages.values())
      .filter(m => m.session_id === sessionId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Analytics
  getAnalytics() {
    const sessions = this.getAllSessions();
    const patients = this.getAllPatients();

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgSatisfaction = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.satisfaction_score || 0), 0) / completedSessions.length
      : 0;

    const issueCategories = sessions.reduce((acc, s) => {
      acc[s.issue_category] = (acc[s.issue_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPatients: patients.length,
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      completedSessions: completedSessions.length,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      issueCategories,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const mockDB = new MockDatabase();
