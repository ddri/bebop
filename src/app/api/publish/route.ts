import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { collectionId, content } = await request.json();
    
    const publishedContent = await prisma.publishedContent.create({
      data: {
        fileName: `${collectionId}.html`,
        content,
        createdAt: new Date()
      }
    });

    return NextResponse.json({ url: `/api/publish/${publishedContent.id}` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to publish content' }, { status: 500 });
  }
}