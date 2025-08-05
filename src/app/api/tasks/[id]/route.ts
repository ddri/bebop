import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const task = await prisma.manualTask.findUnique({
      where: { id: params.id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Manual task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to fetch manual task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      platform, 
      status, 
      dueDate, 
      completedAt, 
      instructions, 
      notes 
    } = body;

    const task = await prisma.manualTask.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(platform !== undefined && { platform }),
        ...(status && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(instructions !== undefined && { instructions }),
        ...(notes !== undefined && { notes })
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to update manual task:', error);
    return NextResponse.json(
      { error: 'Failed to update manual task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  try {
    await prisma.manualTask.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete manual task:', error);
    return NextResponse.json(
      { error: 'Failed to delete manual task' },
      { status: 500 }
    );
  }
}