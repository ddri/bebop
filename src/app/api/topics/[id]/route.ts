import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, content, description } = await request.json();
    const topic = await prisma.topic.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        content,
        description,
      },
    });
    return NextResponse.json(topic);
  } catch (error) {
    console.error('Failed to update topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.topic.delete({
      where: {
        id: params.id,
      },
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