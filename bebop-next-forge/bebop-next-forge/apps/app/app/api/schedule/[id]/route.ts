import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateScheduleSchema = z.object({
  publishAt: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'PUBLISHED', 'FAILED', 'CANCELLED']).optional(),
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
    const data = updateScheduleSchema.parse(body);

    // Verify the schedule belongs to the user
    const existingSchedule = await database.schedule.findFirst({
      where: {
        id,
        campaign: {
          userId,
        },
      },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Update the schedule
    const updateData: { publishAt?: Date; status?: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED' } = {};
    if (data.publishAt) {
      updateData.publishAt = new Date(data.publishAt);
    }
    if (data.status) {
      updateData.status = data.status;
    }

    const schedule = await database.schedule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
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

    // Verify the schedule belongs to the user
    const existingSchedule = await database.schedule.findFirst({
      where: {
        id,
        campaign: {
          userId,
        },
      },
    });

    if (!existingSchedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Delete the schedule
    await database.schedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}