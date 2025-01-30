import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>
}

export async function PUT(request: Request, props: RouteParams) {
  const params = await props.params;
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