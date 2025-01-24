import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define an interface for the expected params object
interface TopicParams {
  params: { id: string };
}

export async function GET(
  request: Request,
  // Use the interface to type the second argument
  { params }: TopicParams  
) {
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

export async function PUT(request: Request, props: IdParams & { id?: never }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const updatedTopic = await prisma.topic.update({
 // @ts-ignore next/async-params
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