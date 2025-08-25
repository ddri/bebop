// API endpoint for retrieving analytics metrics
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics/analytics-service';

const analyticsService = new AnalyticsService();

// GET /api/analytics/metrics - Get analytics metrics
export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest();
  if (authResult.error) {
    return authResult.error;
  }
  
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'dashboard';
    const contentId = searchParams.get('contentId');
    const campaignId = searchParams.get('campaignId');
    const days = parseInt(searchParams.get('days') || '7');
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get metrics based on type
    switch (type) {
      case 'content':
        if (!contentId) {
          return NextResponse.json({ error: 'contentId required' }, { status: 400 });
        }
        const contentMetrics = await getContentMetrics(contentId, startDate, endDate);
        return NextResponse.json(contentMetrics);
      
      case 'campaign':
        if (!campaignId) {
          return NextResponse.json({ error: 'campaignId required' }, { status: 400 });
        }
        const campaignMetrics = await getCampaignMetrics(campaignId, startDate, endDate);
        return NextResponse.json(campaignMetrics);
      
      case 'dashboard':
      default:
        const dashboardMetrics = await getDashboardMetrics(authResult.userId, startDate, endDate);
        return NextResponse.json(dashboardMetrics);
    }
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Get content-specific metrics
async function getContentMetrics(contentId: string, startDate: Date, endDate: Date) {
  // Get content details
  const content = await prisma.topic.findUnique({
    where: { id: contentId }
  });
  
  if (!content) {
    throw new Error('Content not found');
  }
  
  // Get analytics events
  const events = await prisma.analyticsEvent.findMany({
    where: {
      contentId,
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  // Calculate metrics
  const views = events.filter(e => e.eventType === 'content.view').length;
  const reads = events.filter(e => e.eventType === 'content.read').length;
  const completions = events.filter(e => e.eventType === 'content.complete').length;
  const shares = events.filter(e => e.eventType === 'content.share').length;
  
  // Calculate unique visitors
  const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
  
  // Calculate average read time
  const readEvents = events.filter(e => e.eventType === 'content.exit' || e.eventType === 'content.complete');
  const avgReadTime = readEvents.length > 0 
    ? readEvents.reduce((sum, e) => sum + (e.metadata?.readTime || 0), 0) / readEvents.length 
    : 0;
  
  // Calculate average scroll depth
  const scrollEvents = events.filter(e => e.metadata?.scrollDepth);
  const avgScrollDepth = scrollEvents.length > 0
    ? scrollEvents.reduce((sum, e) => sum + (e.metadata?.scrollDepth || 0), 0) / scrollEvents.length
    : 0;
  
  // Platform breakdown
  const platformMap = new Map<string, number>();
  events.forEach(e => {
    if (e.platform) {
      platformMap.set(e.platform, (platformMap.get(e.platform) || 0) + 1);
    }
  });
  
  const platforms = Array.from(platformMap.entries()).map(([platform, count]) => ({
    platform,
    views: count,
    engagement: Math.round((count / views) * 100),
    clickThrough: 0, // Would need to track separately
    avgReadTime: avgReadTime
  }));
  
  return {
    contentId,
    title: content.name,
    type: 'topic',
    views,
    uniqueVisitors,
    reads,
    completions,
    avgReadTime: Math.round(avgReadTime),
    avgScrollDepth: Math.round(avgScrollDepth),
    shares,
    engagementRate: analyticsService.calculateEngagementRate(views, reads, shares),
    platforms,
    publishedAt: content.createdAt,
    lastViewedAt: events[events.length - 1]?.timestamp || null
  };
}

// Get campaign metrics
async function getCampaignMetrics(campaignId: string, startDate: Date, endDate: Date) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      publishingPlans: true
    }
  });
  
  if (!campaign) {
    throw new Error('Campaign not found');
  }
  
  // Get all content IDs for this campaign
  const topicIds = campaign.publishingPlans.map(p => p.topicId);
  
  // Get analytics events for all campaign content
  const events = await prisma.analyticsEvent.findMany({
    where: {
      contentId: { in: topicIds },
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }
  });
  
  // Calculate metrics
  const totalViews = events.filter(e => e.eventType === 'content.view').length;
  const totalEngagement = events.filter(e => 
    ['content.read', 'content.share', 'content.complete'].includes(e.eventType)
  ).length;
  const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
  
  return {
    campaignId,
    name: campaign.name,
    totalViews,
    totalEngagement,
    uniqueVisitors,
    conversionRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
    contentCount: campaign.publishingPlans.length,
    publishedCount: campaign.publishingPlans.filter(p => p.status === 'published').length,
    avgContentPerformance: totalViews / Math.max(campaign.publishingPlans.length, 1),
    topContent: [], // Would need to aggregate
    goals: [], // Would need goal tracking
    goalsCompleted: 0,
    overallProgress: 0,
    startDate: campaign.startDate || campaign.createdAt,
    endDate: campaign.endDate,
    lastActivity: events[events.length - 1]?.timestamp || campaign.updatedAt
  };
}

// Get dashboard overview metrics
async function getDashboardMetrics(userId: string, startDate: Date, endDate: Date) {
  // Get all user's content
  const topics = await prisma.topic.findMany({
    select: { id: true }
  });
  
  const topicIds = topics.map(t => t.id);
  
  // Get analytics events
  const events = await prisma.analyticsEvent.findMany({
    where: {
      contentId: { in: topicIds },
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { timestamp: 'desc' }
  });
  
  // Get previous period for comparison
  const prevEndDate = new Date(startDate);
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - (endDate.getDate() - startDate.getDate()));
  
  const prevEvents = await prisma.analyticsEvent.findMany({
    where: {
      contentId: { in: topicIds },
      timestamp: {
        gte: prevStartDate,
        lte: prevEndDate
      }
    }
  });
  
  // Calculate current period metrics
  const totalViews = events.filter(e => e.eventType === 'content.view').length;
  const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
  const totalShares = events.filter(e => e.eventType === 'content.share').length;
  
  // Calculate previous period metrics
  const prevViews = prevEvents.filter(e => e.eventType === 'content.view').length;
  const prevVisitors = new Set(prevEvents.map(e => e.visitorId)).size;
  const prevShares = prevEvents.filter(e => e.eventType === 'content.share').length;
  
  // Calculate changes
  const viewsChange = prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : 0;
  const visitorsChange = prevVisitors > 0 ? ((uniqueVisitors - prevVisitors) / prevVisitors) * 100 : 0;
  const sharesChange = prevShares > 0 ? ((totalShares - prevShares) / prevShares) * 100 : 0;
  
  // Platform breakdown
  const platformMap = new Map<string, number>();
  events.forEach(e => {
    if (e.platform) {
      platformMap.set(e.platform, (platformMap.get(e.platform) || 0) + 1);
    }
  });
  
  const platformBreakdown = Array.from(platformMap.entries())
    .map(([platform, views]) => ({
      platform,
      views,
      percentage: (views / totalViews) * 100
    }))
    .sort((a, b) => b.views - a.views);
  
  // Traffic pattern by hour
  const trafficPattern = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    views: events.filter(e => {
      const eventHour = new Date(e.timestamp).getHours();
      return e.eventType === 'content.view' && eventHour === hour;
    }).length
  }));
  
  // Top countries
  const countryMap = new Map<string, number>();
  events.forEach(e => {
    const country = e.geo?.country;
    if (country) {
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    }
  });
  
  const topCountries = Array.from(countryMap.entries())
    .map(([country, visitors]) => ({
      country,
      visitors,
      percentage: (visitors / uniqueVisitors) * 100
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);
  
  return {
    period: {
      start: startDate,
      end: endDate,
      label: analyticsService.getPeriodLabel(startDate, endDate)
    },
    overview: {
      totalViews,
      uniqueVisitors,
      avgReadTime: 0, // Would need to calculate
      totalShares,
      engagementRate: analyticsService.calculateEngagementRate(totalViews, 0, totalShares),
      viewsChange,
      visitorsChange,
      readTimeChange: 0,
      sharesChange
    },
    topContent: [], // Would need to aggregate
    recentlyPublished: [], // Would need to query
    trending: [], // Would need to calculate growth rate
    platformBreakdown,
    trafficPattern,
    topCountries
  };
}