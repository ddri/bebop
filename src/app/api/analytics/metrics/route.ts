// API endpoint for retrieving analytics metrics
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { AnalyticsService } from '@/lib/analytics/analytics-service';
import { AnalyticsAggregatorService } from '@/lib/analytics/aggregator-service';
import { analyticsCacheService, determineCacheTTL } from '@/lib/analytics/cache-service';
import { handleAnalyticsError, validateDateRange, validateContentId, validateCampaignId } from '@/lib/analytics/errors';

const analyticsService = new AnalyticsService();
const aggregatorService = new AnalyticsAggregatorService();

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
        const dashboardMetrics = await getDashboardMetrics(authResult.userId, startDate, endDate, days);
        return NextResponse.json(dashboardMetrics);
    }
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    const errorResponse = handleAnalyticsError(error);
    return NextResponse.json(
      { error: errorResponse.error, code: errorResponse.code },
      { status: errorResponse.statusCode }
    );
  }
}

// Get content-specific metrics
async function getContentMetrics(contentId: string, startDate: Date, endDate: Date) {
  validateContentId(contentId);
  validateDateRange(startDate, endDate);
  
  // Check cache first
  const cached = await analyticsCacheService.getCachedContentMetrics(contentId, startDate, endDate);
  if (cached) {
    console.log('📊 Returning cached content metrics');
    return cached;
  }
  // Get content details
  const content = await prisma.topic.findUnique({
    where: { id: contentId }
  });
  
  if (!content) {
    console.warn(`Content not found: ${contentId}`);
    return {
      contentId,
      title: 'Unknown Content',
      type: 'topic',
      views: 0,
      uniqueVisitors: 0,
      reads: 0,
      completions: 0,
      avgReadTime: 0,
      avgScrollDepth: 0,
      shares: 0,
      engagementRate: 0,
      platforms: [],
      publishedAt: new Date(),
      lastViewedAt: null
    };
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
  
  // Calculate unique visitors (filter out null/undefined)
  const uniqueVisitors = new Set(events.filter(e => e.visitorId).map(e => e.visitorId)).size;
  
  // Calculate average read time
  const readEvents = events.filter(e => e.eventType === 'content.exit' || e.eventType === 'content.complete');
  const avgReadTime = readEvents.length > 0 
    ? readEvents.reduce((sum, e) => sum + (typeof e.metadata === 'object' && e.metadata && 'readTime' in e.metadata ? Number(e.metadata.readTime) || 0 : 0), 0) / readEvents.length 
    : 0;
  
  // Calculate average scroll depth
  const scrollEvents = events.filter(e => typeof e.metadata === 'object' && e.metadata && 'scrollDepth' in e.metadata);
  const avgScrollDepth = scrollEvents.length > 0
    ? scrollEvents.reduce((sum, e) => sum + (typeof e.metadata === 'object' && e.metadata && 'scrollDepth' in e.metadata ? Number(e.metadata.scrollDepth) || 0 : 0), 0) / scrollEvents.length
    : 0;
  
  // Platform breakdown with detailed metrics
  const platformMap = new Map<string, {
    views: number;
    reads: number;
    shares: number;
    avgReadTime: number;
  }>();
  
  events.forEach(e => {
    if (e.platform) {
      const existing = platformMap.get(e.platform) || {
        views: 0,
        reads: 0,
        shares: 0,
        avgReadTime: 0
      };

      if (e.eventType === 'content.view') existing.views++;
      if (e.eventType === 'content.read') existing.reads++;
      if (e.eventType === 'content.share') existing.shares++;
      
      // Add read time if available
      if (e.eventType === 'content.read' && typeof e.metadata === 'object' && e.metadata && 'readTime' in e.metadata) {
        const currentReadTime = Number(e.metadata.readTime) || 0;
        existing.avgReadTime = (existing.avgReadTime + currentReadTime) / 2;
      }

      platformMap.set(e.platform, existing);
    }
  });
  
  const platforms = Array.from(platformMap.entries()).map(([platform, metrics]) => ({
    platform,
    views: metrics.views,
    engagement: metrics.views > 0 ? Math.round(((metrics.reads + metrics.shares) / metrics.views) * 100) : 0,
    clickThrough: metrics.views > 0 ? Math.round((metrics.reads / metrics.views) * 100) : 0,
    avgReadTime: Math.round(metrics.avgReadTime)
  }));
  
  const result = {
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
  
  // Cache the result
  const ttl = determineCacheTTL(startDate, endDate);
  await analyticsCacheService.cacheContentMetrics(contentId, startDate, endDate, result, ttl);
  
  return result;
}

// Get campaign metrics
async function getCampaignMetrics(campaignId: string, startDate: Date, endDate: Date) {
  validateCampaignId(campaignId);
  validateDateRange(startDate, endDate);
  
  // Check cache first
  const cached = await analyticsCacheService.getCachedCampaignMetrics(campaignId, startDate, endDate);
  if (cached) {
    console.log('📊 Returning cached campaign metrics');
    return cached;
  }
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      publishingPlans: true
    }
  });
  
  if (!campaign) {
    console.warn(`Campaign not found: ${campaignId}`);
    return {
      campaignId,
      name: 'Unknown Campaign',
      totalViews: 0,
      totalEngagement: 0,
      uniqueVisitors: 0,
      conversionRate: 0,
      contentCount: 0,
      publishedCount: 0,
      avgContentPerformance: 0,
      topContent: [],
      goals: [],
      goalsCompleted: 0,
      overallProgress: 0,
      startDate: new Date(),
      endDate: new Date(),
      lastActivity: new Date()
    };
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

  // Get top performing content for this campaign
  const campaignTopContent = await Promise.all(
    topicIds.slice(0, 5).map(async (topicId) => {
      try {
        const content = await prisma.topic.findUnique({
          where: { id: topicId }
        });
        
        if (!content) {
          console.warn(`Topic not found for campaign content: ${topicId}`);
          return null;
        }

        const contentEvents = events.filter(e => e.contentId === topicId);
        const views = contentEvents.filter(e => e.eventType === 'content.view').length;
        const reads = contentEvents.filter(e => e.eventType === 'content.read').length;
        const shares = contentEvents.filter(e => e.eventType === 'content.share').length;

        return {
          contentId: topicId,
          title: content.name,
          type: 'topic' as const,
          views,
          uniqueVisitors: new Set(contentEvents.map(e => e.visitorId)).size,
          reads,
          completions: contentEvents.filter(e => e.eventType === 'content.complete').length,
          avgReadTime: Math.round(contentEvents.filter(e => e.eventType === 'content.read' && typeof e.metadata === 'object' && e.metadata && 'readTime' in e.metadata).reduce((sum, e) => sum + (Number(e.metadata.readTime) || 0), 0) / Math.max(1, reads)),
          avgScrollDepth: 0,
          shares,
          engagementRate: views > 0 ? ((reads + shares) / views) * 100 : 0,
          platforms: [],
          publishedAt: content.createdAt,
          lastViewedAt: contentEvents[contentEvents.length - 1]?.timestamp || null
        };
      } catch {
        return null;
      }
    })
  );

  const topContent = campaignTopContent
    .filter((content): content is NonNullable<typeof content> => content !== null)
    .sort((a, b) => b.views - a.views);
  
  const result = {
    campaignId,
    name: campaign.name,
    totalViews,
    totalEngagement,
    uniqueVisitors,
    conversionRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
    contentCount: campaign.publishingPlans.length,
    publishedCount: campaign.publishingPlans.filter(p => p.status === 'published').length,
    avgContentPerformance: totalViews / Math.max(campaign.publishingPlans.length, 1),
    topContent,
    goals: [],
    goalsCompleted: 0,
    overallProgress: 0,
    startDate: campaign.startDate || campaign.createdAt,
    endDate: campaign.endDate,
    lastActivity: events[events.length - 1]?.timestamp || campaign.updatedAt
  };
  
  // Cache the result
  const ttl = determineCacheTTL(startDate, endDate);
  await analyticsCacheService.cacheCampaignMetrics(campaignId, startDate, endDate, result, ttl);
  
  return result;
}

// Get dashboard overview metrics
async function getDashboardMetrics(userId: string, startDate: Date, endDate: Date, days: number) {
  validateDateRange(startDate, endDate);
  
  // Check cache first
  const cached = await analyticsCacheService.getCachedDashboardMetrics(userId, startDate, endDate, days);
  if (cached) {
    console.log('📊 Returning cached dashboard metrics');
    return cached;
  }
  
  // Try to use optimized aggregation service
  try {
    const metrics = await aggregatorService.getDashboardMetrics(userId, startDate, endDate, days);
    
    // Cache the result
    const ttl = determineCacheTTL(startDate, endDate);
    await analyticsCacheService.cacheDashboardMetrics(userId, startDate, endDate, days, metrics, ttl);
    
    return metrics;
  } catch (error) {
    console.warn('Aggregation service failed, falling back to real-time calculation:', error);
    // Fallback to existing implementation
  }
  // Get all user's content
  try {
    const topics = await prisma.topic.findMany({
      select: { id: true }
    });
    
    const topicIds = topics?.map(t => t.id) || [];
    
    if (topicIds.length === 0) {
      console.warn('No topics found for dashboard metrics');
      return {
        period: {
          start: startDate,
          end: endDate,
          label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        },
        overview: {
          totalViews: 0,
          uniqueVisitors: 0,
          avgReadTime: 0,
          totalShares: 0,
          engagementRate: 0,
          viewsChange: 0,
          visitorsChange: 0,
          readTimeChange: 0,
          sharesChange: 0
        },
        topContent: [],
        recentlyPublished: [],
        trending: [],
        platformBreakdown: [],
        trafficPattern: [],
        topCountries: []
      };
    }
    
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
  const prevVisitors = new Set(prevEvents.filter(e => e.visitorId).map(e => e.visitorId)).size;
  const prevShares = prevEvents.filter(e => e.eventType === 'content.share').length;
  
  // Calculate average read time
  const readEvents = events.filter(e => 
    e.eventType === 'content.complete' || e.eventType === 'content.read'
  );
  const totalReadTime = readEvents.reduce((sum, e) => {
    const readTime = typeof e.metadata === 'object' && e.metadata && 'readTime' in e.metadata 
      ? Number(e.metadata.readTime) || 0 
      : 0;
    return sum + readTime;
  }, 0);
  const avgReadTime = readEvents.length > 0 ? Math.round(totalReadTime / readEvents.length) : 0;
  
  // Calculate previous period read time
  const prevReadEvents = prevEvents.filter(e => 
    e.eventType === 'content.complete' || e.eventType === 'content.read'
  );
  const prevTotalReadTime = prevReadEvents.reduce((sum, e) => {
    const readTime = typeof e.metadata === 'object' && e.metadata && 'readTime' in e.metadata 
      ? Number(e.metadata.readTime) || 0 
      : 0;
    return sum + readTime;
  }, 0);
  const prevAvgReadTime = prevReadEvents.length > 0 ? Math.round(prevTotalReadTime / prevReadEvents.length) : 0;

  // Calculate changes
  const viewsChange = prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : 0;
  const visitorsChange = prevVisitors > 0 ? ((uniqueVisitors - prevVisitors) / prevVisitors) * 100 : 0;
  const sharesChange = prevShares > 0 ? ((totalShares - prevShares) / prevShares) * 100 : 0;
  const readTimeChange = prevAvgReadTime > 0 ? ((avgReadTime - prevAvgReadTime) / prevAvgReadTime) * 100 : 0;
  
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
    if (typeof e.geo === 'object' && e.geo && 'country' in e.geo) {
      const country = String(e.geo.country);
      if (country) {
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      }
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

  // Get top performing content
  const contentPerformance = new Map<string, {
    contentId: string;
    views: number;
    reads: number;
    shares: number;
    engagementRate: number;
    title: string;
    publishedAt: Date;
    lastViewedAt: Date | null;
  }>();

  // Aggregate metrics by content
  events.forEach(e => {
    if (e.contentId) {
      const existing = contentPerformance.get(e.contentId) || {
        contentId: e.contentId,
        views: 0,
        reads: 0,
        shares: 0,
        engagementRate: 0,
        title: 'Unknown Content',
        publishedAt: new Date(),
        lastViewedAt: null
      };

      if (e.eventType === 'content.view') existing.views++;
      if (e.eventType === 'content.read') existing.reads++;
      if (e.eventType === 'content.share') existing.shares++;
      existing.lastViewedAt = e.timestamp;

      contentPerformance.set(e.contentId, existing);
    }
  });

  // Get content details and calculate engagement rates
  const topContentPromises = Array.from(contentPerformance.entries())
    .map(async ([contentId, metrics]) => {
      try {
        try {
          const content = await prisma.topic.findUnique({
            where: { id: contentId }
          });

          if (content) {
          const engagementRate = analyticsService.calculateEngagementRate(
            metrics.views, 
            metrics.reads, 
            metrics.shares
          );

          return {
            contentId,
            title: content.name,
            type: 'topic' as const,
            views: metrics.views,
            uniqueVisitors: 0, // Would need separate calculation
            reads: metrics.reads,
            completions: contentEvents.filter(e => e.eventType === 'content.complete').length,
            avgReadTime: Math.round(contentEvents.filter(e => e.eventType === 'content.read' && typeof e.metadata === 'object' && e.metadata && 'readTime' in e.metadata).reduce((sum, e) => sum + (Number(e.metadata.readTime) || 0), 0) / Math.max(1, metrics.reads)),
            avgScrollDepth: 0, // Would need separate calculation
            shares: metrics.shares,
            engagementRate,
            platforms: [], // Would need separate calculation
            publishedAt: content.createdAt,
            lastViewedAt: metrics.lastViewedAt
          };
          }
        } catch (error) {
          console.warn(`Error fetching content ${contentId}:`, error);
        }
        return null;
      } catch (error) {
        console.warn(`Error processing content metrics for ${contentId}:`, error);
        return null;
      }
    });

  const topContentResults = await Promise.all(topContentPromises);
  const topContent = topContentResults
    .filter((content): content is NonNullable<typeof content> => content !== null)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Get recently published content  
  const recentlyPublished = await prisma.topic.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      createdAt: true
    }
  });

  const recentlyPublishedMetrics = recentlyPublished.map(content => {
    const contentEvents = events.filter(e => e.contentId === content.id);
    const views = contentEvents.filter(e => e.eventType === 'content.view').length;
    const reads = contentEvents.filter(e => e.eventType === 'content.read').length;
    const shares = contentEvents.filter(e => e.eventType === 'content.share').length;

    return {
      contentId: content.id,
      title: content.name,
      type: 'topic' as const,
      views,
      uniqueVisitors: new Set(contentEvents.map(e => e.visitorId)).size,
      reads,
      completions: contentEvents.filter(e => e.eventType === 'content.complete').length,
      avgReadTime: Math.round(contentEvents.filter(e => e.eventType === 'content.read' && typeof e.metadata === 'object' && e.metadata && 'readTime' in e.metadata).reduce((sum, e) => sum + (Number(e.metadata.readTime) || 0), 0) / Math.max(1, reads)),
      avgScrollDepth: 0,
      shares,
      engagementRate: analyticsService.calculateEngagementRate(views, reads, shares),
      platforms: [],
      publishedAt: content.createdAt,
      lastViewedAt: contentEvents[contentEvents.length - 1]?.timestamp || null
    };
  });

  // Calculate trending content (growth rate)
  const trending = topContent.filter(content => {
    // Only include content from current period that's showing growth
    const daysSincePublish = Math.floor(
      (endDate.getTime() - new Date(content.publishedAt || endDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSincePublish <= days && content.views > 0;
  }).sort((a, b) => {
    // Sort by views per day since published
    const aDaysOld = Math.max(1, Math.floor(
      (endDate.getTime() - new Date(a.publishedAt || endDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const bDaysOld = Math.max(1, Math.floor(
      (endDate.getTime() - new Date(b.publishedAt || endDate).getTime()) / (1000 * 60 * 60 * 24)
    ));
    const aGrowthRate = a.views / aDaysOld;
    const bGrowthRate = b.views / bDaysOld;
    return bGrowthRate - aGrowthRate;
  }).slice(0, 3);
  
  const result = {
    period: {
      start: startDate,
      end: endDate,
      label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    },
    overview: {
      totalViews,
      uniqueVisitors,
      avgReadTime,
      totalShares,
      engagementRate: analyticsService.calculateEngagementRate(totalViews, 0, totalShares),
      viewsChange,
      visitorsChange,
      readTimeChange,
      sharesChange
    },
    topContent,
    recentlyPublished: recentlyPublishedMetrics,
    trending,
    platformBreakdown,
    trafficPattern,
    topCountries
  };
  
    // Cache the result
    const ttl = determineCacheTTL(startDate, endDate);
    await analyticsCacheService.cacheDashboardMetrics(userId, startDate, endDate, days, result, ttl);
    
    return result;
  } catch (error) {
    console.error('Error generating dashboard metrics:', error);
    // Return empty but valid dashboard structure
    return {
      period: {
        start: startDate,
        end: endDate,
        label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      },
      overview: {
        totalViews: 0,
        uniqueVisitors: 0,
        avgReadTime: 0,
        totalShares: 0,
        engagementRate: 0,
        viewsChange: 0,
        visitorsChange: 0,
        readTimeChange: 0,
        sharesChange: 0
      },
      topContent: [],
      recentlyPublished: [],
      trending: [],
      platformBreakdown: [],
      trafficPattern: [],
      topCountries: []
    };
  }
}