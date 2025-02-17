// app/api/publishing-plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.publishingPlan.delete({
      where: {
        id: params.id
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
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
    return NextResponse.json(
      { error: 'Internal error' }, 
      { status: 500 }
    );
  }
}