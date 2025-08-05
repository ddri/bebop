import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { validateContentStaging } from '@/lib/validation/campaign-validation';
import { validateContentStagingReferences } from '@/lib/validation/referential-integrity';

export async function GET() {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const contentStaging = await prisma.contentStaging.findMany({
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

    return NextResponse.json(contentStaging);
  } catch (error) {
    console.error('Failed to fetch content staging:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch content staging',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
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
    const validation = validateContentStaging(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Check referential integrity
    const { campaignId, topicId } = validation.data;
    const referenceCheck = await validateContentStagingReferences(campaignId, topicId);
    if (!referenceCheck.valid) {
      return NextResponse.json(
        { 
          error: 'Reference validation failed',
          details: referenceCheck.errors
        },
        { status: 400 }
      );
    }

    // Create the content staging
    const contentStaging = await prisma.contentStaging.create({
      data: {
        campaignId: validation.data.campaignId,
        topicId: validation.data.topicId,
        status: validation.data.status,
        platforms: validation.data.platforms,
        scheduledFor: validation.data.scheduledFor ? new Date(validation.data.scheduledFor) : null
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

    return NextResponse.json(contentStaging, { status: 201 });
  } catch (error) {
    console.error('Failed to create content staging:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create content staging',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}