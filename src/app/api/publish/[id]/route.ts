import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const publishedContent = await prisma.publishedContent.findUnique({
      where: { id: params.id }
    });

    if (!publishedContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return new NextResponse(publishedContent.content, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}