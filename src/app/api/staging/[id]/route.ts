import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { validateContentStagingUpdate } from '@/lib/validation/campaign-validation';
import { checkContentStagingExists } from '@/lib/validation/referential-integrity';

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
    const contentStaging = await prisma.contentStaging.findUnique({
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

    if (!contentStaging) {
      return NextResponse.json(
        { error: 'Content staging not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contentStaging);
  } catch (error) {
    console.error('Failed to fetch content staging:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content staging' },
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
    // Check if staging exists
    const existsCheck = await checkContentStagingExists(params.id);
    if (!existsCheck.exists) {
      return NextResponse.json(
        { error: existsCheck.error },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input data
    const validation = validateContentStagingUpdate(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (validation.data.status) updateData.status = validation.data.status;
    if (validation.data.platforms) updateData.platforms = validation.data.platforms;
    if (validation.data.scheduledFor !== undefined) {
      updateData.scheduledFor = validation.data.scheduledFor ? new Date(validation.data.scheduledFor) : null;
    }

    const contentStaging = await prisma.contentStaging.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(contentStaging);
  } catch (error) {
    console.error('Failed to update content staging:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update content staging',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
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
    await prisma.contentStaging.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete content staging:', error);
    return NextResponse.json(
      { error: 'Failed to delete content staging' },
      { status: 500 }
    );
  }
}