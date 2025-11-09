import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
