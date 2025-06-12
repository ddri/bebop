// app/api/publishing-plans/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(req: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await req.json();
    
    // Basic input validation
    if (!body.campaignId || !body.topicId || !body.platform) {
      return NextResponse.json(
        { error: 'Campaign ID, Topic ID, and Platform are required' },
        { status: 400 }
      );
    }
    
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
    return NextResponse.json({ error: 'Failed to create publishing plan' }, { status: 500 });
  }
}