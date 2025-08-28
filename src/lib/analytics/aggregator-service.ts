// Analytics aggregation service for efficient metric computation
import { PrismaClient } from '@prisma/client';
import { MetricCalculator } from './metric-calculator';
import { AnalyticsError, MetricsNotFoundError } from './errors';

const prisma = new PrismaClient();
const calculator = new MetricCalculator();

export class AnalyticsAggregatorService {
  
  /**
   * Aggregate analytics data for a specific date
   * This should be run daily via a scheduled job
   */
  async aggregateDaily(date: Date): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all events for the day
      const events = await prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      if (events.length === 0) return;

      // Group by content, campaign, platform
      const aggregationGroups = this.groupEventsByDimensions(events);

      // Process each group
      const aggregates = [];
      for (const [key, groupEvents] of aggregationGroups.entries()) {
        const { contentId, campaignId, platform } = this.parseGroupKey(key);
        
        const metrics = await calculator.calculateAggregateMetrics(groupEvents);
        
        aggregates.push({
          contentId,
          campaignId, 
          platform,
          date: startOfDay,
          hour: null, // Daily aggregate
          ...metrics,
          aggregatedAt: new Date()
        });
      }

      // Upsert aggregates (update if exists, create if new)
      await prisma.$transaction(
        aggregates.map(aggregate => 
          prisma.analyticsAggregate.upsert({
            where: {
              contentId_campaignId_platform_date_hour: {
                contentId: aggregate.contentId,
                campaignId: aggregate.campaignId,
                platform: aggregate.platform,
                date: aggregate.date,
                hour: aggregate.hour
              }
            },
            update: aggregate,
            create: aggregate
          })
        )
      );

      console.log(`✅ Aggregated ${aggregates.length} metric groups for ${date.toDateString()}`);
      
    } catch (error) {
      throw new AnalyticsError(`Failed to aggregate daily metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Aggregate hourly data for more granular analysis
   */
  async aggregateHourly(date: Date, hour: number): Promise<void> {
    try {
      const startOfHour = new Date(date);
      startOfHour.setHours(hour, 0, 0, 0);
      
      const endOfHour = new Date(date);
      endOfHour.setHours(hour, 59, 59, 999);

      const events = await prisma.analyticsEvent.findMany({
        where: {
          timestamp: {
            gte: startOfHour,
            lte: endOfHour
          }
        }
      });

      if (events.length === 0) return;

      const aggregationGroups = this.groupEventsByDimensions(events);
      const aggregates = [];

      for (const [key, groupEvents] of aggregationGroups.entries()) {
        const { contentId, campaignId, platform } = this.parseGroupKey(key);
        const metrics = await calculator.calculateAggregateMetrics(groupEvents);
        
        aggregates.push({
          contentId,
          campaignId,
          platform,
          date: startOfHour,
          hour,
          ...metrics,
          aggregatedAt: new Date()
        });
      }

      await prisma.$transaction(
        aggregates.map(aggregate => 
          prisma.analyticsAggregate.upsert({
            where: {
              contentId_campaignId_platform_date_hour: {
                contentId: aggregate.contentId,
                campaignId: aggregate.campaignId,
                platform: aggregate.platform,
                date: aggregate.date,
                hour: aggregate.hour
              }
            },
            update: aggregate,
            create: aggregate
          })
        )
      );

    } catch (error) {
      throw new AnalyticsError(`Failed to aggregate hourly metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get optimized dashboard metrics using aggregated data
   */
  async getDashboardMetrics(userId: string, startDate: Date, endDate: Date, days: number) {
    try {
      // Use aggregated data when available, fall back to real-time for recent data
      const shouldUseAggregates = this.shouldUseAggregatedData(startDate, endDate);
      
      if (shouldUseAggregates) {
        return await this.getDashboardMetricsFromAggregates(userId, startDate, endDate, days);
      } else {
        return await this.getDashboardMetricsRealtime(userId, startDate, endDate, days);
      }
      
    } catch (error) {
      throw new MetricsNotFoundError(`Failed to retrieve dashboard metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Group events by aggregation dimensions
   */
  private groupEventsByDimensions(events: unknown[]): Map<string, unknown[]> {
    const groups = new Map<string, unknown[]>();
    
    events.forEach((event: any) => {
      const key = this.createGroupKey(event.contentId, event.campaignId, event.platform);
      const existing = groups.get(key) || [];
      existing.push(event);
      groups.set(key, existing);
    });
    
    return groups;
  }

  /**
   * Create a unique key for grouping events
   */
  private createGroupKey(contentId: string | null, campaignId: string | null, platform: string | null): string {
    return `${contentId || 'null'}_${campaignId || 'null'}_${platform || 'null'}`;
  }

  /**
   * Parse group key back into dimensions
   */
  private parseGroupKey(key: string): { contentId: string | null; campaignId: string | null; platform: string | null } {
    const [contentId, campaignId, platform] = key.split('_');
    return {
      contentId: contentId === 'null' ? null : contentId,
      campaignId: campaignId === 'null' ? null : campaignId,
      platform: platform === 'null' ? null : platform
    };
  }

  /**
   * Determine if we should use pre-aggregated data
   */
  private shouldUseAggregatedData(startDate: Date, endDate: Date): boolean {
    const now = new Date();
    const hoursOld = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60);
    
    // Use aggregates for data older than 2 hours
    return hoursOld > 2;
  }

  /**
   * Get metrics from pre-computed aggregates (fast)
   */
  private async getDashboardMetricsFromAggregates(userId: string, startDate: Date, endDate: Date, days: number) {
    // Implementation using aggregated data for performance
    const aggregates = await prisma.analyticsAggregate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return calculator.computeDashboardFromAggregates(aggregates, userId, startDate, endDate, days);
  }

  /**
   * Get real-time metrics for recent data (slower but accurate)
   */
  private async getDashboardMetricsRealtime(userId: string, startDate: Date, endDate: Date, days: number) {
    // For real-time data, calculate directly from events
    // This is used when data is too recent for aggregates
    const topics = await prisma.topic.findMany({
      select: { id: true }
    });
    
    const topicIds = topics.map(t => t.id);
    
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
    
    return calculator.computeDashboardFromEvents(events, userId, startDate, endDate, days);
  }

  /**
   * Clean up old aggregated data
   */
  async cleanupOldAggregates(olderThanDays: number = 365): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const deleted = await prisma.analyticsAggregate.deleteMany({
      where: {
        date: {
          lt: cutoffDate
        }
      }
    });

    console.log(`🗑️ Cleaned up ${deleted.count} old analytics aggregates`);
  }
}