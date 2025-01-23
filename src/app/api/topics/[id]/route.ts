import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
 ) {
  const id = await params.id;
  try {
    const publishedContent = await prisma.publishedContent.findUnique({
      where: { id }
    });
 
    if (!publishedContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
 
    return new NextResponse(publishedContent.content, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Failed to update topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' }, { status: 500 });
    }
  }

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await params.id;
  try {
    const body = await request.json();
    console.log('Request body:', body);
    const updatedTopic = await prisma.topic.update({  // Changed from publishedContent
      where: { id: params.id },
      data: body
    });
    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error('Failed to update topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}