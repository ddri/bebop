// app/api/publishing-plans/process-scheduled/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST() {
  // Check authentication - in production this should use an API key or be secured differently
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    // Find all scheduled publishing plans that are due to be published
    const now = new Date();
    const duePlans = await prisma.publishingPlan.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now
        }
      },
      include: {
        campaign: true
      }
    });

    if (duePlans.length === 0) {
      return NextResponse.json({ 
        message: 'No scheduled publications due for processing',
        processed: 0 
      });
    }

    const results = [];
    
    for (const plan of duePlans) {
      try {
        // Fetch the topic data separately
        const topic = await prisma.topic.findUnique({
          where: { id: plan.topicId }
        });

        // For now, we'll mark as published immediately
        // In a real implementation, this would make API calls to the actual platforms
        const updatedPlan = await prisma.publishingPlan.update({
          where: { id: plan.id },
          data: {
            status: 'published',
            publishedAt: new Date(),
            publishedUrl: `https://${plan.platform}.example.com/published/${plan.id}`
          }
        });

        results.push({
          id: plan.id,
          platform: plan.platform,
          topicName: topic?.name,
          campaignName: plan.campaign.name,
          status: 'processed'
        });
      } catch (error) {
        console.error(`Failed to process plan ${plan.id}:`, error);
        
        // Mark as failed
        await prisma.publishingPlan.update({
          where: { id: plan.id },
          data: {
            status: 'failed'
          }
        });

        // Fetch topic for error reporting
        const topic = await prisma.topic.findUnique({
          where: { id: plan.topicId }
        }).catch(() => null);

        results.push({
          id: plan.id,
          platform: plan.platform,
          topicName: topic?.name,
          campaignName: plan.campaign.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} scheduled publications`,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Error processing scheduled publications:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled publications' }, 
      { status: 500 }
    );
  }
}