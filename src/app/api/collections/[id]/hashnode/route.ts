import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Collection } from '@prisma/client';

// Create a type that only includes the fields we want to update
type CollectionUpdateInput = {
  hashnodeUrl: string | null;
  lastEdited: Date;
};

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { hashnodeUrl } = await request.json();
    
    const updateData: CollectionUpdateInput = {
      hashnodeUrl,
      lastEdited: new Date()
    };
    
    const collection = await prisma.collection.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update Hashnode URL' },
      { status: 500 }
    );
  }
}