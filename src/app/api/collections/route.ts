// src/app/api/collections/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const collections = await prisma.collections.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
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