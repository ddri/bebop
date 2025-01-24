import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: (params as { id: string }).id } 
    });

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Failed to fetch collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, description, topicIds, publishedUrl } = await request.json();
    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(topicIds && { topicIds }),
        ...(publishedUrl !== undefined && { publishedUrl }),
        lastEdited: new Date(),
      },
    });
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.collection.delete({
      where: { id: params.id }
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
} 