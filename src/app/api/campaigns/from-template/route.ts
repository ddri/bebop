import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { CampaignTemplateStructure } from '@/types/campaign-templates';

export async function POST(request: Request) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { templateId, name, description, startDate, adjustSchedule = true } = body;

    // Validate required fields
    if (!templateId || !name) {
      return NextResponse.json(
        { error: 'Template ID and name are required' },
        { status: 400 }
      );
    }

    // Fetch the template
    const template = await prisma.campaignTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    if (!template.isPublic && template.userId !== authResult.userId) {
      return NextResponse.json(
        { error: 'Access denied to this template' },
        { status: 403 }
      );
    }

    const structure = template.structure as CampaignTemplateStructure;
    const campaignStartDate = startDate ? new Date(startDate) : new Date();
    
    // Calculate end date based on template duration
    const campaignEndDate = new Date(campaignStartDate);
    campaignEndDate.setDate(campaignEndDate.getDate() + structure.suggestedDuration);

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description: description || template.description || `Campaign created from template: ${template.name}`,
        status: 'draft',
        startDate: campaignStartDate,
        endDate: campaignEndDate
      }
    });

    // Create content staging items from template slots
    const stagingPromises = structure.contentSlots.map(async (slot) => {
      let scheduledFor = null;
      if (adjustSchedule && slot.suggestedSchedule) {
        scheduledFor = new Date(campaignStartDate);
        scheduledFor.setDate(scheduledFor.getDate() + slot.suggestedSchedule.daysFromStart);
        
        // Set time if provided
        if (slot.suggestedSchedule.timeOfDay) {
          const [hours, minutes] = slot.suggestedSchedule.timeOfDay.split(':');
          scheduledFor.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }
      }

      // Note: We're creating placeholder staging items. In a real scenario,
      // you'd need to link these to actual topics or create placeholder topics
      return prisma.contentStaging.create({
        data: {
          campaignId: campaign.id,
          topicId: '000000000000000000000000', // Placeholder - needs actual topic creation
          status: 'draft',
          platforms: slot.platforms,
          scheduledFor
        }
      });
    });

    // Create manual tasks from template
    const taskPromises = structure.tasks.map(async (taskTemplate) => {
      let dueDate = null;
      if (adjustSchedule) {
        dueDate = new Date(campaignStartDate);
        dueDate.setDate(dueDate.getDate() + taskTemplate.daysFromStart);
      }

      return prisma.manualTask.create({
        data: {
          campaignId: campaign.id,
          title: taskTemplate.title,
          description: taskTemplate.description,
          platform: taskTemplate.platform,
          status: 'todo',
          dueDate,
          instructions: taskTemplate.instructions
        }
      });
    });

    // Execute all promises
    await Promise.all([...stagingPromises, ...taskPromises]);

    // Update template usage count
    await prisma.campaignTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date()
      }
    });

    // Fetch the complete campaign with relations
    const completeCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        contentStaging: true,
        manualTasks: true,
        publishingPlans: true
      }
    });

    return NextResponse.json(completeCampaign, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign from template:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign from template' },
      { status: 500 }
    );
  }
}