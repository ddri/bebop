// app/api/collections/[id]/devto/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { devToUrl } = await request.json();
    
    const updatedCollection = await prisma.collections.update({
      where: { id: params.id },
      data: {
        devToUrl,
        lastEdited: new Date(),
      },
    });

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Failed to update Dev.to URL:', error);
    return NextResponse.json(
      { error: 'Failed to update Dev.to URL' },
      { status: 500 }
    );
  }
}