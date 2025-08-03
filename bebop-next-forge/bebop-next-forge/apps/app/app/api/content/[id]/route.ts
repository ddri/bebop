import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { ContentStatus, ContentType } from '@repo/database/types';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateContentSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  type: z.nativeEnum(ContentType).optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  campaignId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await database.content.findFirst({
      where: {
        id,
        campaign: {
          userId,
        },
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        schedules: {
          include: {
            destination: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
          orderBy: { publishAt: 'desc' },
        },
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateContentSchema.parse(body);

    // Check if content exists and belongs to user
    const existingContent = await database.content.findFirst({
      where: {
        id,
        campaign: {
          userId,
        },
      },
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // If campaignId is being changed, verify the new campaign belongs to the user
    if (validatedData.campaignId) {
      const campaign = await database.campaign.findFirst({
        where: { id: validatedData.campaignId, userId },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
    }

    const updatedContent = await database.content.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to update content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await context.params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if content exists and belongs to user
    const existingContent = await database.content.findFirst({
      where: {
        id,
        campaign: {
          userId,
        },
      },
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Delete any related schedules first
    await database.schedule.deleteMany({
      where: { contentId: id },
    });

    // Delete the content
    await database.content.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
