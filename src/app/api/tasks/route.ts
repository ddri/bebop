import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { validateManualTask } from '@/lib/validation/campaign-validation';
import { validateManualTaskReferences } from '@/lib/validation/referential-integrity';

export async function GET() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const tasks = await prisma.manualTask.findMany({
      orderBy: {
        createdAt: 'desc'
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

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch manual tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manual tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();

    // Validate input data with Zod
    const validation = validateManualTask(body);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Check referential integrity
    const { campaignId, contentStagingId } = validation.data;
    const referenceCheck = await validateManualTaskReferences(campaignId, contentStagingId);
    if (!referenceCheck.valid) {
      return NextResponse.json(
        { 
          error: 'Reference validation failed',
          details: referenceCheck.errors
        },
        { status: 400 }
      );
    }

    // Create the manual task
    const task = await prisma.manualTask.create({
      data: {
        campaignId: validation.data.campaignId,
        contentStagingId: validation.data.contentStagingId || null,
        title: validation.data.title,
        description: validation.data.description || null,
        platform: validation.data.platform || null,
        status: validation.data.status,
        dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : null,
        instructions: validation.data.instructions || null,
        notes: validation.data.notes || null
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create manual task:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create manual task',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}