import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams  // This is the fixed type
) {
  try {
    const { hashnodeUrl } = await request.json();
    
    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: {
        hashnodeUrl,
        lastEdited: new Date(),
      },
    });
    
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update Hashnode URL' },
      { status: 500 }
    );
  }
}