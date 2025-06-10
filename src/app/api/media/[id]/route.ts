// app/api/media/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFileFromStorage } from '@/lib/storage';
import { authenticateRequest } from '@/lib/auth';

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const mediaItem = await prisma.mediaItem.findUnique({
      where: { id: params.id }
    });

    if (!mediaItem) {
      return NextResponse.json(
        { error: 'Media item not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    await deleteFileFromStorage(mediaItem.url);

    // Delete from database
    await prisma.mediaItem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}