import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  // Additional safety check - only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Cleanup not allowed in production' },
      { status: 403 }
    );
  }

  try {
    // Delete all existing topics
    await prisma.topic.deleteMany({});
    
    // Delete all existing collections
    await prisma.collections.deleteMany({});
    
    return NextResponse.json({ message: 'Database cleaned successfully' });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to clean database' },
      { status: 500 }
    );
  }
}