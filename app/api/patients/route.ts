import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mockDatabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone required' },
        { status: 400 }
      );
    }

    const patient = mockDB.createPatient({ name, email, phone });
    return NextResponse.json({ patient });
  } catch (error) {
    console.error('Patient creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const patient = mockDB.getPatient(id);
      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ patient });
    }

    const patients = mockDB.getAllPatients();
    return NextResponse.json({ patients });
  } catch (error) {
    console.error('Patient fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}
