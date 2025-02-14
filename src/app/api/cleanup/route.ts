import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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