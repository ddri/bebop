// src/app/api/collections/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { executeWithRetryAndErrorHandling } from '@/lib/db-utils';

export async function GET() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const result = await executeWithRetryAndErrorHandling(
    () => prisma.collections.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    }),
    'fetch collections'
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
    const body = await request.json();
    const { name, description, topicIds } = body;

    // Basic input validation
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const collection = await prisma.collections.create({
      data: {
        name,
        description,
        topicIds: topicIds || [],
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Failed to create collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}