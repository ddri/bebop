// app/api/scheduler/trigger/route.ts
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function POST() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    // Manually trigger the scheduled publication processing
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3007';
    const response = await fetch(`${baseUrl}/api/publishing-plans/process-scheduled`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Scheduler returned ${response.status}`);
    }

    const result = await response.json();
    
    return NextResponse.json({
      message: 'Scheduler triggered successfully',
      result
    });

  } catch (error) {
    console.error('Error triggering scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to trigger scheduler' }, 
      { status: 500 }
    );
  }
}