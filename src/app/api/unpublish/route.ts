import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { collectionId } = await request.json();

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.collections.update({
        where: { id: collectionId },
        data: { publishedUrl: null }
      });

      await tx.publishedContent.deleteMany({
        where: { fileName: `${collectionId}.html` }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unpublish:', error);
    return NextResponse.json({ error: 'Failed to unpublish content' }, { status: 500 });
  }
}