import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createContentSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  excerpt: z.string().optional(),
  type: z.enum(['BLOG_POST', 'EMAIL', 'SOCIAL_POST', 'TWITTER', 'LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'CUSTOM']),
  status: z.enum(['DRAFT', 'READY', 'PUBLISHED', 'ARCHIVED']),
  campaignId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createContentSchema.parse(body);

    // Verify the campaign belongs to the user
    const campaign = await database.campaign.findFirst({
      where: {
        id: data.campaignId,
        userId,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const content = await database.content.create({
      data: {
        title: data.title,
        body: data.body,
        excerpt: data.excerpt || null,
        type: data.type,
        status: data.status,
        campaignId: data.campaignId,
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await database.content.findMany({
      where: {
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
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}