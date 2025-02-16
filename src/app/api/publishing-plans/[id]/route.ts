// app/api/publishing-plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await prisma.publishingPlan.delete({
      where: {
        id: context.params.id
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting publishing plan:', error);
    return NextResponse.json(
      { error: 'Internal error' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const publishingPlan = await prisma.publishingPlan.update({
      where: {
        id: context.params.id
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
    return NextResponse.json(
      { error: 'Internal error' }, 
      { status: 500 }
    );
  }
}