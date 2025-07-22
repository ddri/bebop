import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createDestinationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['HASHNODE', 'DEVTO', 'BLUESKY', 'MASTODON', 'WORDPRESS', 'GHOST', 'MAILCHIMP', 'SENDGRID', 'TWITTER', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'WEBHOOK', 'CUSTOM']),
  config: z.record(z.any()),
  isActive: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = createDestinationSchema.parse(body);

    const destination = await database.destination.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        config: data.config,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(destination);
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json(
      { error: 'Failed to create destination' },
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

    const destinations = await database.destination.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}