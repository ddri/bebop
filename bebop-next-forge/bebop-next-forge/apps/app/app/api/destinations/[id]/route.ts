import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateDestinationSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['HASHNODE', 'DEVTO', 'BLUESKY', 'MASTODON', 'WORDPRESS', 'GHOST', 'MAILCHIMP', 'SENDGRID', 'TWITTER', 'LINKEDIN', 'FACEBOOK', 'INSTAGRAM', 'WEBHOOK', 'CUSTOM']).optional(),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateDestinationSchema.parse(body);

    // Verify the destination belongs to the user
    const existingDestination = await database.destination.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingDestination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    const destination = await database.destination.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json(destination);
  } catch (error) {
    console.error('Error updating destination:', error);
    return NextResponse.json(
      { error: 'Failed to update destination' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the destination belongs to the user
    const existingDestination = await database.destination.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingDestination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    await database.destination.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return NextResponse.json(
      { error: 'Failed to delete destination' },
      { status: 500 }
    );
  }
}