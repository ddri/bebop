import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const { collectionId, content } = await request.json();
    
    // Basic input validation
    if (!collectionId || !content) {
      return NextResponse.json(
        { error: 'Collection ID and content are required' },
        { status: 400 }
      );
    }
    
    const publishedContent = await prisma.publishedContent.create({
      data: {
        fileName: `${collectionId}.html`,
        content,
        createdAt: new Date()
      }
    });

    return NextResponse.json({ url: `/api/publish/${publishedContent.id}` });
  } catch (error) {
    console.error('Failed to publish content:', error);
    return NextResponse.json({ error: 'Failed to publish content' }, { status: 500 });
  }
}