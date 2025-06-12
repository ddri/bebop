import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

interface TopicParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, props: TopicParams) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: params.id }
    });

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Failed to fetch topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, props: TopicParams) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const body = await request.json();
    
    // Basic input validation
    if (body.name !== undefined && !body.name) {
      return NextResponse.json(
        { error: 'Topic name cannot be empty' },
        { status: 400 }
      );
    }
    
    const updatedTopic = await prisma.topic.update({
      where: { id: params.id },
      data: body,
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

export async function DELETE(request: Request, props: TopicParams) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    await prisma.topic.delete({
      where: { id: params.id }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}