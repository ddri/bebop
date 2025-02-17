// app/api/publishing-plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RouteParams = {
  params: Promise<{ id: string }> | { id: string };
};

export async function DELETE(request: NextRequest, props: RouteParams) {
  const params = 'then' in props.params ? await props.params : props.params;
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

export async function PATCH(request: NextRequest, props: RouteParams) {
  const params = 'then' in props.params ? await props.params : props.params;
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