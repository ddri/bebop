import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
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
          userId
        }
      },
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Create duplicate with "Copy of" prefix
    const duplicatedContent = await database.content.create({
      data: {
        title: `Copy of ${existingContent.title}`,
        body: existingContent.body,
        excerpt: existingContent.excerpt,
        type: existingContent.type,
        status: 'DRAFT', // Always create duplicates as drafts
        campaignId: existingContent.campaignId,
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

    return NextResponse.json(duplicatedContent);
  } catch (error) {
    console.error('Failed to duplicate content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}