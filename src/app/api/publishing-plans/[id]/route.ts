// app/api/publishing-plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.publishingPlan.delete({
      where: {
        id: params.id
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting publishing plan:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const publishingPlan = await prisma.publishingPlan.update({
      where: {
        id: params.id
      },
      data: {
        status: body.status,
        publishedAt: body.publishedAt,
        publishedUrl: body.publishedUrl
      }
    });
    return NextResponse.json(publishingPlan);
  } catch (error) {
    console.error('Error updating publishing plan:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}