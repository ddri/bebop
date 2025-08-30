import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { 
  CampaignExportData, 
  CampaignExportOptions,
  CAMPAIGN_EXPORT_VERSION 
} from '@/types/campaign-export';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }

  const params = await props.params;
  const campaignId = params.id;
  
  // Parse export options from query params
  const { searchParams } = new URL(request.url);
  const options: CampaignExportOptions = {
    includeContent: searchParams.get('includeContent') !== 'false',
    includeContentDetails: searchParams.get('includeContentDetails') === 'true',
    includeTasks: searchParams.get('includeTasks') !== 'false',
    includePublishingPlans: searchParams.get('includePublishingPlans') !== 'false',
    includeAnalytics: searchParams.get('includeAnalytics') === 'true',
    includeGoals: searchParams.get('includeGoals') === 'true',
    format: (searchParams.get('format') as 'json' | 'csv') || 'json',
    prettify: searchParams.get('prettify') !== 'false',
    anonymize: searchParams.get('anonymize') === 'true',
    excludeSecrets: searchParams.get('excludeSecrets') !== 'false'
  };

  try {
    // Fetch campaign with all relations
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        contentStaging: options.includeContent,
        manualTasks: options.includeTasks,
        publishingPlans: options.includePublishingPlans
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Format based on requested type
    if (options.format === 'csv') {
      return exportAsCSV(campaign, options);
    } else {
      return exportAsJSON(campaign, options, authResult.userId);
    }
  } catch (error) {
    console.error('Failed to export campaign:', error);
    return NextResponse.json(
      { error: 'Failed to export campaign' },
      { status: 500 }
    );
  }
}

interface CampaignWithRelations {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
  settings?: unknown;
  metadata?: unknown;
  contentStaging?: Array<{
    id: string;
    topicId: string;
    status: string;
    platforms: string[];
    scheduledFor?: Date | null;
  }>;
  manualTasks?: Array<{
    id: string;
    title: string;
    description?: string | null;
    platform?: string | null;
    status: string;
    dueDate?: Date | null;
    completedAt?: Date | null;
    instructions?: string | null;
  }>;
  publishingPlans?: Array<{
    id: string;
    topicId: string;
    platform: string;
    scheduledAt?: Date | null;
    publishedAt?: Date | null;
    status: string;
    platformPostId?: string | null;
    metrics?: unknown;
  }>;
}

interface Topic {
  id: string;
  name: string;
  description?: string | null;
  content?: string | null;
  metadata?: unknown;
}

async function exportAsJSON(
  campaign: CampaignWithRelations,
  options: CampaignExportOptions,
  userId?: string
): Promise<NextResponse> {
  // Fetch topics if content details are requested
  const topicsMap = new Map<string, Topic>();
  if (options.includeContent && options.includeContentDetails && campaign.contentStaging) {
    const topicIds = [...new Set(campaign.contentStaging.map(cs => cs.topicId))];
    const topics = await prisma.topic.findMany({
      where: { id: { in: topicIds } }
    });
    topics.forEach(topic => topicsMap.set(topic.id, topic));
  }

  // Build export data
  const exportData: CampaignExportData = {
    version: CAMPAIGN_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy: options.anonymize ? undefined : userId,
    
    campaign: {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      startDate: campaign.startDate?.toISOString(),
      endDate: campaign.endDate?.toISOString(),
      settings: options.excludeSecrets ? undefined : campaign.settings,
      metadata: campaign.metadata
    },
    
    contentStaging: [],
    manualTasks: [],
    publishingPlans: [],
    analytics: undefined,
    goals: undefined
  };

  // Add content staging
  if (options.includeContent && campaign.contentStaging) {
    exportData.contentStaging = campaign.contentStaging.map(cs => {
      const topic = topicsMap.get(cs.topicId);
      return {
        id: cs.id,
        topicId: cs.topicId,
        status: cs.status as 'draft' | 'ready' | 'scheduled',
        platforms: cs.platforms,
        scheduledFor: cs.scheduledFor?.toISOString(),
        topic: topic && options.includeContentDetails ? {
          name: topic.name,
          description: topic.description || undefined,
          content: topic.content || undefined,
          metadata: topic.metadata
        } : undefined
      };
    });
  }

  // Add manual tasks
  if (options.includeTasks && campaign.manualTasks) {
    exportData.manualTasks = campaign.manualTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      platform: task.platform || undefined,
      status: task.status as 'todo' | 'in_progress' | 'completed',
      dueDate: task.dueDate?.toISOString(),
      completedAt: task.completedAt?.toISOString(),
      instructions: task.instructions || undefined
    }));
  }

  // Add publishing plans
  if (options.includePublishingPlans && campaign.publishingPlans) {
    exportData.publishingPlans = campaign.publishingPlans.map(plan => ({
      id: plan.id,
      topicId: plan.topicId,
      platform: plan.platform,
      scheduledAt: plan.scheduledAt?.toISOString(),
      publishedAt: plan.publishedAt?.toISOString(),
      status: plan.status,
      platformPostId: options.excludeSecrets ? undefined : plan.platformPostId,
      metrics: plan.metrics
    }));
  }

  // Add analytics snapshot if requested
  if (options.includeAnalytics) {
    // This would fetch from analytics service
    // For now, adding placeholder
    exportData.analytics = {
      totalViews: 0,
      totalEngagement: 0,
      totalShares: 0,
      platforms: [],
      exportedAt: new Date().toISOString()
    };
  }

  // Return JSON response
  const jsonString = options.prettify 
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="campaign-${campaign.id}-${Date.now()}.json"`
    }
  });
}

async function exportAsCSV(
  campaign: CampaignWithRelations,
  options: CampaignExportOptions
): Promise<NextResponse> {
  // Build CSV data
  const csvData: string[] = [];
  
  // Campaign summary
  csvData.push('Campaign Summary');
  csvData.push('ID,Name,Status,Start Date,End Date,Content Count,Task Count');
  csvData.push([
    campaign.id,
    `"${campaign.name}"`,
    campaign.status,
    campaign.startDate?.toISOString() || '',
    campaign.endDate?.toISOString() || '',
    campaign.contentStaging?.length || 0,
    campaign.manualTasks?.length || 0
  ].join(','));
  csvData.push('');

  // Content staging
  if (options.includeContent && campaign.contentStaging && campaign.contentStaging.length > 0) {
    csvData.push('Content Staging');
    csvData.push('ID,Topic ID,Status,Platforms,Scheduled For');
    campaign.contentStaging.forEach(cs => {
      csvData.push([
        cs.id,
        cs.topicId,
        cs.status,
        `"${cs.platforms.join(', ')}"`,
        cs.scheduledFor?.toISOString() || ''
      ].join(','));
    });
    csvData.push('');
  }

  // Manual tasks
  if (options.includeTasks && campaign.manualTasks && campaign.manualTasks.length > 0) {
    csvData.push('Manual Tasks');
    csvData.push('ID,Title,Status,Platform,Due Date,Completed At');
    campaign.manualTasks.forEach(task => {
      csvData.push([
        task.id,
        `"${task.title}"`,
        task.status,
        task.platform || '',
        task.dueDate?.toISOString() || '',
        task.completedAt?.toISOString() || ''
      ].join(','));
    });
    csvData.push('');
  }

  // Publishing plans
  if (options.includePublishingPlans && campaign.publishingPlans && campaign.publishingPlans.length > 0) {
    csvData.push('Publishing Plans');
    csvData.push('ID,Topic ID,Platform,Status,Scheduled At,Published At');
    campaign.publishingPlans.forEach(plan => {
      csvData.push([
        plan.id,
        plan.topicId,
        plan.platform,
        plan.status,
        plan.scheduledAt?.toISOString() || '',
        plan.publishedAt?.toISOString() || ''
      ].join(','));
    });
  }

  const csvString = csvData.join('\n');

  return new NextResponse(csvString, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="campaign-${campaign.id}-${Date.now()}.csv"`
    }
  });
}