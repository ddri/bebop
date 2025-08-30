import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { 
  CampaignExportData, 
  CampaignImportOptions,
  CampaignImportResult,
  validateExportData 
} from '@/types/campaign-export';

export async function POST(request: NextRequest) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { data, options }: { data: unknown; options: CampaignImportOptions } = body;

    // Validate export data format
    if (!validateExportData(data)) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    const exportData = data as CampaignExportData;
    const result: CampaignImportResult = {
      success: false,
      imported: {
        contentStaging: 0,
        manualTasks: 0,
        publishingPlans: 0,
        goals: 0
      },
      skipped: {
        contentStaging: 0,
        manualTasks: 0,
        publishingPlans: 0,
        goals: 0
      },
      errors: [],
      warnings: []
    };

    // Check for conflicts
    if (options.conflictResolution === 'skip') {
      const existingCampaign = await prisma.campaign.findFirst({
        where: { name: exportData.campaign.name }
      });
      
      if (existingCampaign) {
        result.errors.push({
          type: 'conflict',
          message: 'Campaign with this name already exists',
          field: 'name'
        });
        return NextResponse.json(result, { status: 409 });
      }
    }

    // Prepare campaign name
    let campaignName = exportData.campaign.name;
    if (options.namePrefix) campaignName = options.namePrefix + campaignName;
    if (options.nameSuffix) campaignName = campaignName + options.nameSuffix;
    
    // Handle duplicate names
    if (options.conflictResolution === 'duplicate') {
      const existingCount = await prisma.campaign.count({
        where: { 
          name: { 
            startsWith: campaignName 
          } 
        }
      });
      if (existingCount > 0) {
        campaignName = `${campaignName} (${existingCount + 1})`;
      }
    }

    // Calculate date offset
    let dateOffset = 0;
    if (options.adjustDates && options.dateOffset) {
      dateOffset = options.dateOffset * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    } else if (options.adjustDates && exportData.campaign.startDate) {
      // Auto-calculate offset to start from today
      const originalStart = new Date(exportData.campaign.startDate);
      const today = new Date();
      dateOffset = today.getTime() - originalStart.getTime();
    }

    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        description: exportData.campaign.description,
        status: options.resetStatus ? 'draft' : exportData.campaign.status,
        startDate: exportData.campaign.startDate 
          ? new Date(new Date(exportData.campaign.startDate).getTime() + dateOffset)
          : undefined,
        endDate: exportData.campaign.endDate
          ? new Date(new Date(exportData.campaign.endDate).getTime() + dateOffset)
          : undefined,
        settings: exportData.campaign.settings,
        metadata: exportData.campaign.metadata
      }
    });

    result.campaignId = campaign.id;

    // Import content staging
    if (options.includeContent && exportData.contentStaging.length > 0) {
      for (const staging of exportData.contentStaging) {
        try {
          // First, check if we need to create the topic
          let topicId = staging.topicId;
          
          if (staging.topic) {
            // Create a new topic with the exported data
            const newTopic = await prisma.topic.create({
              data: {
                name: staging.topic.name,
                description: staging.topic.description,
                content: staging.topic.content || '',
                status: 'draft',
                metadata: staging.topic.metadata
              }
            });
            topicId = newTopic.id;
          }

          await prisma.contentStaging.create({
            data: {
              campaignId: campaign.id,
              topicId: topicId,
              status: options.resetStatus ? 'draft' : staging.status,
              platforms: staging.platforms,
              scheduledFor: staging.scheduledFor && options.adjustDates
                ? new Date(new Date(staging.scheduledFor).getTime() + dateOffset)
                : staging.scheduledFor ? new Date(staging.scheduledFor) : undefined
            }
          });
          result.imported.contentStaging++;
        } catch (error) {
          console.error('Failed to import content staging:', error);
          result.skipped.contentStaging++;
          result.warnings.push(`Failed to import content staging item: ${staging.id}`);
        }
      }
    }

    // Import manual tasks
    if (options.includeTasks && exportData.manualTasks.length > 0) {
      for (const task of exportData.manualTasks) {
        try {
          await prisma.manualTask.create({
            data: {
              campaignId: campaign.id,
              title: task.title,
              description: task.description,
              platform: task.platform,
              status: options.resetStatus ? 'todo' : task.status,
              dueDate: task.dueDate && options.adjustDates
                ? new Date(new Date(task.dueDate).getTime() + dateOffset)
                : task.dueDate ? new Date(task.dueDate) : undefined,
              completedAt: options.resetStatus ? undefined : 
                (task.completedAt ? new Date(task.completedAt) : undefined),
              instructions: task.instructions
            }
          });
          result.imported.manualTasks++;
        } catch (error) {
          console.error('Failed to import manual task:', error);
          result.skipped.manualTasks++;
          result.warnings.push(`Failed to import task: ${task.title}`);
        }
      }
    }

    // Import publishing plans (if not resetting status)
    if (options.includePublishingPlans && !options.resetStatus && exportData.publishingPlans.length > 0) {
      for (const plan of exportData.publishingPlans) {
        try {
          await prisma.publishingPlan.create({
            data: {
              campaignId: campaign.id,
              topicId: plan.topicId,
              platform: plan.platform,
              scheduledAt: plan.scheduledAt && options.adjustDates
                ? new Date(new Date(plan.scheduledAt).getTime() + dateOffset)
                : plan.scheduledAt ? new Date(plan.scheduledAt) : undefined,
              publishedAt: plan.publishedAt ? new Date(plan.publishedAt) : undefined,
              status: plan.status,
              platformPostId: plan.platformPostId,
              metrics: plan.metrics
            }
          });
          result.imported.publishingPlans++;
        } catch (error) {
          console.error('Failed to import publishing plan:', error);
          result.skipped.publishingPlans++;
          result.warnings.push(`Failed to import publishing plan for platform: ${plan.platform}`);
        }
      }
    }

    // Import goals
    if (options.includeGoals && exportData.goals && exportData.goals.length > 0) {
      // Goals would be stored in campaign metadata or a separate table
      // For now, storing in campaign metadata
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          metadata: {
            ...campaign.metadata,
            goals: exportData.goals.map(goal => ({
              ...goal,
              current: options.resetStatus ? 0 : goal.current,
              completedAt: options.resetStatus ? undefined : goal.completedAt
            }))
          }
        }
      });
      result.imported.goals = exportData.goals.length;
    }

    result.success = true;

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Failed to import campaign:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}