import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createScheduleSchema = z.object({
  contentId: z.string().min(1),
  destinationId: z.string().min(1),
  publishAt: z.string().datetime(),
  status: z.enum(['PENDING', 'PUBLISHED', 'FAILED', 'CANCELLED']),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createScheduleSchema.parse(body);

    // Verify the content belongs to the user
    const content = await database.content.findFirst({
      where: {
        id: data.contentId,
        campaign: {
          userId,
        },
      },
      include: {
        campaign: true,
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Verify the destination belongs to the user
    const destination = await database.destination.findFirst({
      where: {
        id: data.destinationId,
        userId,
      },
    });

    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found' },
        { status: 404 }
      );
    }

    const schedule = await database.schedule.create({
      data: {
        campaignId: content.campaign.id,
        contentId: data.contentId,
        destinationId: data.destinationId,
        publishAt: new Date(data.publishAt),
        status: data.status,
      },
    });

    return NextResponse.json(schedule);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create schedule' },
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

    const schedules = await database.schedule.findMany({
      where: {
        campaign: {
          userId,
        },
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        destination: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        publishAt: 'asc',
      },
    });

    return NextResponse.json(schedules);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}
