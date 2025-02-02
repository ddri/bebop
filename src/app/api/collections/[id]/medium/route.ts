// app/api/collections/[id]/medium/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { mediumUrl } = await request.json();
    
    const updatedCollection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        mediumUrl,
        lastEdited: new Date(),
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Failed to update Medium URL:', error);
    return NextResponse.json(
      { error: 'Failed to update Medium URL' },
      { status: 500 }
    );
  }
}