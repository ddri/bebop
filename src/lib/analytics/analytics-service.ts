// Analytics service for event tracking and metrics aggregation
import { 
  AnalyticsEvent, 
  AnalyticsEventType, 
  ContentMetrics, 
  CampaignMetrics,
  DashboardMetrics,
  AnalyticsFilter 
} from './types';
import crypto from 'crypto';

export class AnalyticsService {
  private readonly VISITOR_ROTATION_HOURS = 24; // Privacy: rotate visitor IDs daily
  private readonly SESSION_TIMEOUT_MINUTES = 30;
  
  /**
   * Generate a privacy-safe visitor ID that rotates daily
   */
  generateVisitorId(userAgent?: string, ip?: string): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const seed = `${date}-${userAgent || 'unknown'}-${ip || 'unknown'}`;
    return crypto.createHash('sha256').update(seed).digest('hex').substring(0, 16);
  }
  
  /**
   * Generate or retrieve session ID
   */
  generateSessionId(): string {
    return crypto.randomUUID();
  }
  
  /**
   * Track an analytics event
   */
  async trackEvent(event: Partial<AnalyticsEvent>): Promise<void> {
    const fullEvent: AnalyticsEvent = {
      id: crypto.randomUUID(),
      eventType: event.eventType || 'page.view',
      sessionId: event.sessionId || this.generateSessionId(),
      metadata: event.metadata || {},
      timestamp: new Date(),
      ...event
    };
    
    // Store event (will be implemented with MongoDB)
    await this.storeEvent(fullEvent);
    
    // Trigger real-time update if needed
    if (this.isRealtimeEvent(fullEvent.eventType)) {
      await this.broadcastRealtimeEvent(fullEvent);
    }
  }
  
  /**
   * Get content metrics for a specific piece of content
   */
  async getContentMetrics(contentId: string): Promise<ContentMetrics | null> {
    // This will aggregate from MongoDB
    // For now, returning mock structure
    return {
      contentId,
      title: '',
      type: 'article',
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
      lastViewedAt: new Date()
    };
  }
  
  /**
   * Get dashboard metrics for overview
   */
  async getDashboardMetrics(filter?: AnalyticsFilter): Promise<DashboardMetrics> {
    const endDate = filter?.dateRange?.end || new Date();
    const startDate = filter?.dateRange?.start || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // This will aggregate from MongoDB
    // For now, returning mock structure
    return {
      period: {
        start: startDate,
        end: endDate,
        label: this.getPeriodLabel(startDate, endDate)
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
  
  /**
   * Get campaign metrics
   */
  async getCampaignMetrics(_campaignId: string): Promise<CampaignMetrics | null> {
    // This will aggregate from MongoDB
    return null;
  }
  
  /**
   * Calculate engagement rate
   */
  calculateEngagementRate(views: number, reads: number, shares: number): number {
    if (views === 0) return 0;
    return ((reads + shares * 2) / views) * 100;
  }
  
  /**
   * Detect device type from user agent
   */
  detectDevice(userAgent?: string): { type: 'desktop' | 'mobile' | 'tablet' } {
    if (!userAgent) return { type: 'desktop' };
    
    const ua = userAgent.toLowerCase();
    if (/mobile|android|iphone/i.test(ua)) return { type: 'mobile' };
    if (/ipad|tablet/i.test(ua)) return { type: 'tablet' };
    return { type: 'desktop' };
  }
  
  /**
   * Parse country from request headers (privacy-safe)
   */
  parseGeoLocation(headers: Headers): { country?: string; region?: string } {
    // This would typically use CloudFlare or Vercel geo headers
    const country = headers.get('cf-ipcountry') || headers.get('x-vercel-ip-country');
    const region = headers.get('cf-region') || headers.get('x-vercel-ip-country-region');
    
    return {
      country: country || undefined,
      region: region || undefined
    };
  }
  
  /**
   * Store event in database
   */
  private async storeEvent(event: AnalyticsEvent): Promise<void> {
    // Will be implemented with MongoDB
    console.log('Storing analytics event:', event.eventType);
  }
  
  /**
   * Check if event should trigger real-time update
   */
  private isRealtimeEvent(eventType: AnalyticsEventType): boolean {
    return ['content.view', 'content.share', 'publish.success'].includes(eventType);
  }
  
  /**
   * Broadcast real-time event for live dashboard
   */
  private async broadcastRealtimeEvent(event: AnalyticsEvent): Promise<void> {
    // Will be implemented with WebSocket or Server-Sent Events
    console.log('Broadcasting real-time event:', event.eventType);
  }
  
  /**
   * Generate human-readable period label
   */
  private getPeriodLabel(start: Date, end: Date): string {
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days === 7) return 'Last 7 days';
    if (days === 30) return 'Last 30 days';
    if (days === 90) return 'Last 3 months';
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }
  
  /**
   * Aggregate metrics by time period
   */
  async aggregateByPeriod(
    events: AnalyticsEvent[], 
    period: 'hour' | 'day' | 'week' | 'month'
  ): Promise<{ period: string; count: number }[]> {
    const aggregated = new Map<string, number>();
    
    events.forEach(event => {
      const key = this.getPeriodKey(event.timestamp, period);
      aggregated.set(key, (aggregated.get(key) || 0) + 1);
    });
    
    return Array.from(aggregated.entries()).map(([period, count]) => ({
      period,
      count
    }));
  }
  
  /**
   * Get period key for aggregation
   */
  private getPeriodKey(date: Date, period: 'hour' | 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    
    switch (period) {
      case 'hour':
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week':
        const week = Math.floor(d.getDate() / 7);
        return `${d.getFullYear()}-W${week}`;
      case 'month':
        return `${d.getFullYear()}-${d.getMonth() + 1}`;
      default:
        return d.toISOString();
    }
  }
}