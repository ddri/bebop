import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { executeWithErrorHandling } from '@/lib/db-utils';

export async function GET() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const result = await executeWithErrorHandling(
    () => prisma.topic.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    }),
    'fetch topics'
  );

  if (!result.success) {
    return result.response;
  }

  return NextResponse.json(result.data);
}

export async function POST(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const json = await request.json();
    const { name, content } = json;

    if (!name || !content) {
      return NextResponse.json(
        { error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const result = await executeWithErrorHandling(
      () => prisma.topic.create({
        data: {
          name,
          content,
          collectionIds: [] // Initialize empty array for MongoDB
        }
      }),
      'create topic'
    );

    if (!result.success) {
      return result.response;
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    // Handle JSON parsing errors or other non-database errors
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}