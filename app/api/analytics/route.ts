import { NextRequest, NextResponse } from 'next/server';
import { mockDB } from '@/lib/mockDatabase';

export async function GET(req: NextRequest) {
  try {
    const analytics = mockDB.getAnalytics();
    return NextResponse.json({ analytics });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
