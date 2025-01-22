import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { fileName, content } = json;

    if (!fileName || !content) {
      return NextResponse.json(
        { error: 'Filename and content are required' },
        { status: 400 }
      );
    }

    // Store the content in MongoDB using Prisma
    const publishedContent = await prisma.publishedContent.create({
      data: {
        fileName,
        content,
        createdAt: new Date()
      }
    });

    // Generate a URL for accessing the content
    const url = `/api/content/${publishedContent.id}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Failed to publish:', error);
    return NextResponse.json(
      { error: 'Failed to publish content' },
      { status: 500 }
    );
  }
}