import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
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
  try {
    const json = await request.json();
    const { name, description, topicIds } = json;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        topicIds: topicIds || [],
      }
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Failed to create collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}