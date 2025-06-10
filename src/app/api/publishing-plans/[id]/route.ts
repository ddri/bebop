// app/api/publishing-plans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const { id } = await context.params;
  try {
    await prisma.publishingPlan.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting publishing plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete publishing plan' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const { id } = await context.params;
  try {
    const body = await request.json();
    console.log('Updating publishing plan:', { id, body });  // Add debug log
    
    const publishingPlan = await prisma.publishingPlan.update({
      where: { id },
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
      { error: error instanceof Error ? error.message : 'Failed to update publishing plan' }, 
      { status: 500 }
    );
  }
}