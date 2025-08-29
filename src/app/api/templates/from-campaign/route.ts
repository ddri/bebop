import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { CampaignTemplateStructure, ContentSlot, TaskTemplate } from '@/types/campaign-templates';

export async function POST(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { campaignId, name, description, category, isPublic } = body;

    // Validate required fields
    if (!campaignId || !name) {
      return NextResponse.json(
        { error: 'Campaign ID and name are required' },
        { status: 400 }
      );
    }

    // Fetch the campaign with all related data
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        contentStaging: true,
        manualTasks: true,
        publishingPlans: true
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Extract content slots from staging items
    const contentSlots: ContentSlot[] = campaign.contentStaging.map((staging, index) => {
      
      // Calculate days from campaign start
      let daysFromStart = index * 2; // Default: space out by 2 days
      if (staging.scheduledFor && campaign.startDate) {
        const stagingDate = new Date(staging.scheduledFor);
        const startDate = new Date(campaign.startDate);
        daysFromStart = Math.floor((stagingDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        id: `slot-${index + 1}`,
        name: `Content Slot ${index + 1}`,
        description: `Based on staging item ${staging.id}`,
        type: 'article' as const, // Default type
        platforms: staging.platforms,
        suggestedSchedule: {
          daysFromStart: Math.max(0, daysFromStart),
          timeOfDay: staging.scheduledFor ? 
            new Date(staging.scheduledFor).toTimeString().slice(0, 5) : 
            '09:00'
        },
        contentGuidelines: `Status: ${staging.status}`,
        estimatedDuration: 4 // Default 4 hours
      };
    });

    // Extract task templates from manual tasks
    const taskTemplates: TaskTemplate[] = campaign.manualTasks.map((task, index) => {
      let daysFromStart = index * 3; // Default: space out by 3 days
      if (task.dueDate && campaign.startDate) {
        const dueDate = new Date(task.dueDate);
        const startDate = new Date(campaign.startDate);
        daysFromStart = Math.floor((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        id: `task-${index + 1}`,
        title: task.title,
        description: task.description || undefined,
        platform: task.platform || undefined,
        daysFromStart: Math.max(0, daysFromStart),
        instructions: task.instructions || undefined,
        estimatedDuration: 2 // Default 2 hours
      };
    });

    // Calculate campaign duration
    let suggestedDuration = 30; // Default 30 days
    if (campaign.startDate && campaign.endDate) {
      const start = new Date(campaign.startDate);
      const end = new Date(campaign.endDate);
      suggestedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Extract unique platforms
    const platforms = Array.from(new Set([
      ...campaign.contentStaging.flatMap(s => s.platforms),
      ...campaign.publishingPlans.map(p => p.platform),
      ...campaign.manualTasks.map(t => t.platform).filter(Boolean)
    ])) as string[];

    // Build template structure
    const structure: CampaignTemplateStructure = {
      contentSlots,
      tasks: taskTemplates,
      suggestedDuration,
      platforms,
      goals: [], // Could be extracted from campaign description
      targetAudience: undefined // Could be extracted from campaign metadata
    };

    // Create the template
    const template = await prisma.campaignTemplate.create({
      data: {
        name,
        description: description || `Template based on campaign: ${campaign.name}`,
        category: category || 'custom',
        structure,
        isPublic: isPublic || false,
        userId: authResult.userId
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Failed to create template from campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create template from campaign' },
      { status: 500 }
    );
  }
}