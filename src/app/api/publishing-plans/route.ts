// app/api/publishing-plans/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const publishingPlan = await prisma.publishingPlan.create({
      data: {
        campaignId: body.campaignId,
        topicId: body.topicId,
        platform: body.platform,
        scheduledFor: body.scheduledFor,
        status: 'scheduled'
      }
    });
    return NextResponse.json(publishingPlan);
  } catch (error) {
    console.error('Error creating publishing plan:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}