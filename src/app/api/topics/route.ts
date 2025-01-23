import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(topics);
  } catch (error) {
    console.error('Failed to fetch topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, content, description } = await request.json();
    const topic = await prisma.topic.create({
      data: {
        name,
        content,
        description,
      },
    });
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Failed to create topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}