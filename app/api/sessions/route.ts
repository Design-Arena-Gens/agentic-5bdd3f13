import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mockDatabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, issueCategory, symptoms } = body;

    const session = mockDB.createSession({
      patient_id: patientId,
      issue_category: issueCategory || 'general',
      symptoms: symptoms || '',
      diagnosis: '',
      conversation: [],
      status: 'active',
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    const patientId = searchParams.get('patientId');

    if (sessionId) {
      const session = mockDB.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    if (patientId) {
      const sessions = mockDB.getSessionsByPatient(patientId);
      return NextResponse.json({ sessions });
    }

    const sessions = mockDB.getAllSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = mockDB.updateSession(sessionId, updates);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
