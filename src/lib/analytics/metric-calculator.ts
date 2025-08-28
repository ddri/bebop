// Reusable metric calculation utilities
// import { AnalyticsEvent } from '@prisma/client'; // Unused
import { ContentMetrics, PlatformMetrics, DashboardMetrics } from './types';

export class MetricCalculator {
  
  /**
   * Calculate engagement rate: (reads + shares + completions) / views * 100
   */
  calculateEngagementRate(views: number, reads: number, shares: number, completions: number = 0): number {
    if (views === 0) return 0;
    return Math.round(((reads + shares + completions) / views) * 100);
  }

  /**
   * Calculate click-through rate: reads / views * 100  
   */
  calculateClickThroughRate(views: number, reads: number): number {
    if (views === 0) return 0;
    return Math.round((reads / views) * 100);
  }

  /**
   * Calculate completion rate: completions / reads * 100
   */
  calculateCompletionRate(reads: number, completions: number): number {
    if (reads === 0) return 0;
    return Math.round((completions / reads) * 100);
  }

  /**
   * Calculate growth rate for trending content
   */
  calculateGrowthRate(currentViews: number, previousViews: number): number {
    if (previousViews === 0) return currentViews > 0 ? 100 : 0;
    return Math.round(((currentViews - previousViews) / previousViews) * 100);
  }

  /**
   * Calculate daily growth rate based on content age
   */
  calculateDailyGrowthRate(views: number, publishedAt: Date): number {
    const daysSincePublish = Math.max(1, Math.floor(
      (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    ));
    return Math.round(views / daysSincePublish);
  }

  /**
   * Extract read time from event metadata safely
   */
  extractReadTime(event: any): number {
    if (typeof event.metadata === 'object' && event.metadata && 'readTime' in event.metadata) {
      return Number(event.metadata.readTime) || 0;
    }
    return 0;
  }

  /**
   * Extract scroll depth from event metadata safely
   */
  extractScrollDepth(event: any): number {
    if (typeof event.metadata === 'object' && event.metadata && 'scrollDepth' in event.metadata) {
      return Number(event.metadata.scrollDepth) || 0;
    }
    return 0;
  }

  /**
   * Calculate aggregate metrics from a group of events
   */
  async calculateAggregateMetrics(events: any[]) {
    const views = events.filter(e => e.eventType === 'content.view').length;
    const reads = events.filter(e => e.eventType === 'content.read').length;
    const completions = events.filter(e => e.eventType === 'content.complete').length;
    const shares = events.filter(e => e.eventType === 'content.share').length;
    
    const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
    
    // Calculate read times
    const readEvents = events.filter(e => 
      e.eventType === 'content.read' || e.eventType === 'content.complete'
    );
    const totalReadTime = readEvents.reduce((sum, e) => sum + this.extractReadTime(e), 0);
    const avgReadTime = readEvents.length > 0 ? Math.round(totalReadTime / readEvents.length) : 0;

    // Calculate scroll depths  
    const scrollEvents = events.filter(e => e.eventType === 'content.complete');
    const totalScrollDepth = scrollEvents.reduce((sum, e) => sum + this.extractScrollDepth(e), 0);
    const avgScrollDepth = scrollEvents.length > 0 ? Math.round(totalScrollDepth / scrollEvents.length) : 0;

    // Calculate rates
    const engagementRate = this.calculateEngagementRate(views, reads, shares, completions);
    const clickThroughRate = this.calculateClickThroughRate(views, reads);
    const completionRate = this.calculateCompletionRate(reads, completions);

    return {
      views,
      reads, 
      completions,
      shares,
      uniqueVisitors,
      totalReadTime,
      avgReadTime,
      totalScrollDepth,
      avgScrollDepth,
      engagementRate,
      clickThroughRate,
      completionRate
    };
  }

  /**
   * Calculate platform metrics from events
   */
  calculatePlatformMetrics(events: any[]): PlatformMetrics[] {
    const platformGroups = new Map<string, any[]>();
    
    events.forEach(event => {
      if (event.platform) {
        const existing = platformGroups.get(event.platform) || [];
        existing.push(event);
        platformGroups.set(event.platform, existing);
      }
    });

    return Array.from(platformGroups.entries()).map(([platform, platformEvents]) => {
      const views = platformEvents.filter(e => e.eventType === 'content.view').length;
      const reads = platformEvents.filter(e => e.eventType === 'content.read').length;
      const shares = platformEvents.filter(e => e.eventType === 'content.share').length;
      const completions = platformEvents.filter(e => e.eventType === 'content.complete').length;
      
      const readTimes = platformEvents
        .filter(e => e.eventType === 'content.read' || e.eventType === 'content.complete')
        .map(e => this.extractReadTime(e))
        .filter(time => time > 0);
      
      const avgReadTime = readTimes.length > 0 
        ? Math.round(readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length)
        : 0;

      return {
        platform,
        views,
        engagement: this.calculateEngagementRate(views, reads, shares, completions),
        clickThrough: this.calculateClickThroughRate(views, reads),
        avgReadTime
      };
    }).sort((a, b) => b.views - a.views);
  }

  /**
   * Calculate content metrics from events
   */
  async calculateContentMetrics(contentId: string, events: any[]): Promise<Partial<ContentMetrics>> {
    const contentEvents = events.filter(e => e.contentId === contentId);
    const aggregateMetrics = await this.calculateAggregateMetrics(contentEvents);
    
    const platforms = this.calculatePlatformMetrics(contentEvents);
    const lastViewedAt = contentEvents
      .filter(e => e.eventType === 'content.view')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp || null;

    return {
      contentId,
      views: aggregateMetrics.views,
      uniqueVisitors: aggregateMetrics.uniqueVisitors,
      reads: aggregateMetrics.reads,
      completions: aggregateMetrics.completions,
      avgReadTime: aggregateMetrics.avgReadTime,
      avgScrollDepth: aggregateMetrics.avgScrollDepth,
      shares: aggregateMetrics.shares,
      engagementRate: aggregateMetrics.engagementRate,
      platforms,
      lastViewedAt
    };
  }

  /**
   * Compute dashboard metrics from pre-aggregated data
   */
  async computeDashboardFromAggregates(
    aggregates: any[], 
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    days: number
  ): Promise<DashboardMetrics> {
    
    // Sum up all metrics from aggregates
    const totalViews = aggregates.reduce((sum, a) => sum + a.views, 0);
    const uniqueVisitors = aggregates.reduce((sum, a) => sum + a.uniqueVisitors, 0);
    const totalShares = aggregates.reduce((sum, a) => sum + a.shares, 0);
    const totalReadTime = aggregates.reduce((sum, a) => sum + a.totalReadTime, 0);
    const totalReads = aggregates.reduce((sum, a) => sum + a.reads, 0);
    
    const avgReadTime = totalReads > 0 ? Math.round(totalReadTime / totalReads) : 0;

    // Calculate previous period for comparison  
    const prevStartDate = new Date(startDate.getTime() - (days * 24 * 60 * 60 * 1000));
    const prevEndDate = new Date(startDate);
    
    const prevAggregates = await prisma.analyticsAggregate.findMany({
      where: {
        date: {
          gte: prevStartDate,
          lte: prevEndDate
        }
      }
    });

    const prevViews = prevAggregates.reduce((sum, a) => sum + a.views, 0);
    const prevVisitors = prevAggregates.reduce((sum, a) => sum + a.uniqueVisitors, 0);
    const prevShares = prevAggregates.reduce((sum, a) => sum + a.shares, 0);
    const prevTotalReadTime = prevAggregates.reduce((sum, a) => sum + a.totalReadTime, 0);
    const prevTotalReads = prevAggregates.reduce((sum, a) => sum + a.reads, 0);
    const prevAvgReadTime = prevTotalReads > 0 ? Math.round(prevTotalReadTime / prevTotalReads) : 0;

    // Calculate changes
    const viewsChange = this.calculateGrowthRate(totalViews, prevViews);
    const visitorsChange = this.calculateGrowthRate(uniqueVisitors, prevVisitors);
    const sharesChange = this.calculateGrowthRate(totalShares, prevShares);
    const readTimeChange = this.calculateGrowthRate(avgReadTime, prevAvgReadTime);

    // Platform breakdown from aggregates
    const platformBreakdown = this.calculatePlatformBreakdownFromAggregates(aggregates, totalViews);
    
    // Traffic pattern by hour
    const trafficPattern = this.calculateTrafficPatternFromAggregates(aggregates);

    // Top countries from aggregated geo data
    const topCountries = this.extractTopCountriesFromAggregates(aggregates, uniqueVisitors);

    return {
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
        engagementRate: this.calculateEngagementRate(totalViews, totalReads, totalShares),
        viewsChange,
        visitorsChange, 
        readTimeChange,
        sharesChange
      },
      topContent: [], // Will be implemented separately
      recentlyPublished: [], // Will be implemented separately  
      trending: [], // Will be implemented separately
      platformBreakdown,
      trafficPattern,
      topCountries
    };
  }

  /**
   * Fallback to real-time calculation for recent data
   */
  private async getDashboardMetricsRealtime(userId: string, startDate: Date, endDate: Date, days: number) {
    // This would implement the current real-time logic
    // For now, throw an error to indicate it needs implementation
    throw new AnalyticsError('Real-time dashboard metrics calculation not yet implemented');
  }

  /**
   * Calculate platform breakdown from aggregated data
   */
  private calculatePlatformBreakdownFromAggregates(aggregates: any[], totalViews: number) {
    const platformMap = new Map<string, number>();
    
    aggregates.forEach(aggregate => {
      if (aggregate.platform) {
        const existing = platformMap.get(aggregate.platform) || 0;
        platformMap.set(aggregate.platform, existing + aggregate.views);
      }
    });

    return Array.from(platformMap.entries())
      .map(([platform, views]) => ({
        platform,
        views,
        percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0
      }))
      .sort((a, b) => b.views - a.views);
  }

  /**
   * Calculate hourly traffic pattern from aggregated data  
   */
  private calculateTrafficPatternFromAggregates(aggregates: any[]) {
    const hourlyViews = new Array(24).fill(0);
    
    aggregates.forEach(aggregate => {
      if (aggregate.hour !== null && aggregate.hour >= 0 && aggregate.hour < 24) {
        hourlyViews[aggregate.hour] += aggregate.views;
      }
    });

    return hourlyViews.map((views, hour) => ({ hour, views }));
  }

  /**
   * Extract top countries from aggregated geographic data
   */
  private extractTopCountriesFromAggregates(aggregates: any[], totalVisitors: number) {
    const countryMap = new Map<string, number>();
    
    aggregates.forEach(aggregate => {
      if (aggregate.topCountries && Array.isArray(aggregate.topCountries)) {
        aggregate.topCountries.forEach((countryData: any) => {
          if (countryData.country) {
            const existing = countryMap.get(countryData.country) || 0;
            countryMap.set(countryData.country, existing + (countryData.visitors || 0));
          }
        });
      }
    });

    return Array.from(countryMap.entries())
      .map(([country, visitors]) => ({
        country,
        visitors,
        percentage: totalVisitors > 0 ? Math.round((visitors / totalVisitors) * 100) : 0
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
  }

  /**
   * Calculate percentage change between two values
   */
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Format time in seconds to human readable format
   */
  formatReadTime(seconds: number): string {
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Format large numbers with K/M suffixes
   */
  formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  /**
   * Detect content type from metadata
   */
  determineContentType(data: Record<string, unknown>): 'topic' | 'article' | 'post' {
    if (data.type && typeof data.type === 'string') {
      return data.type as 'topic' | 'article' | 'post';
    }
    return 'topic'; // Default
  }

  /**
   * Calculate user retention rate (visits over time)
   */
  calculateRetentionRate(events: any[], dayRange: number): number {
    const userSessions = new Map<string, Set<string>>();
    
    events.forEach(event => {
      if (event.visitorId && event.sessionId) {
        if (!userSessions.has(event.visitorId)) {
          userSessions.set(event.visitorId, new Set());
        }
        userSessions.get(event.visitorId)!.add(
          new Date(event.timestamp).toDateString()
        );
      }
    });

    // Users with multiple session days / total users
    const multiDayUsers = Array.from(userSessions.values())
      .filter(sessions => sessions.size > 1).length;
    
    const totalUsers = userSessions.size;
    
    return totalUsers > 0 ? Math.round((multiDayUsers / totalUsers) * 100) : 0;
  }

  /**
   * Find peak activity periods
   */
  findPeakActivityPeriods(events: any[]): { 
    peakHour: number; 
    peakDay: string;
    peakHourViews: number;
  } {
    // Hour analysis
    const hourlyViews = new Array(24).fill(0);
    const dailyViews = new Map<string, number>();
    
    events.filter(e => e.eventType === 'content.view').forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      hourlyViews[hour]++;
      dailyViews.set(dayName, (dailyViews.get(dayName) || 0) + 1);
    });

    const peakHour = hourlyViews.indexOf(Math.max(...hourlyViews));
    const peakHourViews = hourlyViews[peakHour];
    
    const peakDay = Array.from(dailyViews.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Mon';

    return { peakHour, peakDay, peakHourViews };
  }

  /**
   * Calculate bounce rate (single event sessions)
   */
  calculateBounceRate(events: any[]): number {
    const sessionEventCounts = new Map<string, number>();
    
    events.forEach(event => {
      if (event.sessionId) {
        sessionEventCounts.set(event.sessionId, (sessionEventCounts.get(event.sessionId) || 0) + 1);
      }
    });

    const totalSessions = sessionEventCounts.size;
    const bounceSessions = Array.from(sessionEventCounts.values())
      .filter(count => count === 1).length;

    return totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;
  }

  /**
   * Calculate average session duration
   */
  calculateAvgSessionDuration(events: any[]): number {
    const sessions = new Map<string, { start: Date; end: Date }>();
    
    events.forEach(event => {
      const sessionId = event.sessionId;
      const timestamp = new Date(event.timestamp);
      
      if (sessionId) {
        const existing = sessions.get(sessionId);
        if (!existing) {
          sessions.set(sessionId, { start: timestamp, end: timestamp });
        } else {
          if (timestamp < existing.start) existing.start = timestamp;
          if (timestamp > existing.end) existing.end = timestamp;
        }
      }
    });

    const durations = Array.from(sessions.values())
      .map(session => (session.end.getTime() - session.start.getTime()) / 1000)
      .filter(duration => duration > 0);

    return durations.length > 0 
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;
  }

  /**
   * Compute dashboard metrics directly from events (for real-time data)
   */
  async computeDashboardFromEvents(
    events: any[], 
    userId: string, 
    startDate: Date, 
    endDate: Date, 
    days: number
  ): Promise<DashboardMetrics> {
    
    // Calculate current period metrics
    const totalViews = events.filter(e => e.eventType === 'content.view').length;
    const uniqueVisitors = new Set(events.map(e => e.visitorId)).size;
    const totalShares = events.filter(e => e.eventType === 'content.share').length;
    
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
    
    // Simple implementation for real-time calculation
    return {
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
        engagementRate: this.calculateEngagementRate(totalViews, 0, totalShares),
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