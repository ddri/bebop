// Analytics system types for Bebop
// Privacy-first, real-time content performance tracking

export type AnalyticsEventType = 
  | 'page.view'
  | 'content.view'
  | 'content.read'
  | 'content.complete'
  | 'content.share'
  | 'content.engage'
  | 'publish.success'
  | 'publish.failed'
  | 'campaign.view'
  | 'campaign.goal';

export interface AnalyticsEvent {
  id?: string;
  eventType: AnalyticsEventType;
  contentId?: string;
  campaignId?: string;
  platform?: string;
  sessionId: string;
  visitorId?: string; // Anonymous, rotates daily for privacy
  
  // Event-specific data
  metadata: {
    url?: string;
    referrer?: string;
    title?: string;
    readTime?: number; // seconds
    scrollDepth?: number; // percentage
    shareTarget?: string;
    goalType?: string;
    goalValue?: number;
    [key: string]: unknown;
  };
  
  // User agent data (privacy-safe)
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
  };
  
  // Geographic data (privacy-safe, country-level only)
  geo?: {
    country?: string;
    region?: string; // Optional, state/province level max
  };
  
  timestamp: Date;
}

export interface ContentMetrics {
  contentId: string;
  title: string;
  type: 'topic' | 'article' | 'post';
  
  // Core metrics
  views: number;
  uniqueVisitors: number;
  reads: number; // Started reading (> 10 seconds)
  completions: number; // Finished reading (> 80% scroll)
  
  // Engagement metrics
  avgReadTime: number; // seconds
  avgScrollDepth: number; // percentage
  shares: number;
  engagementRate: number; // (reads + shares) / views
  
  // Platform breakdown
  platforms: PlatformMetrics[];
  
  // Time-based data
  publishedAt?: Date;
  lastViewedAt?: Date;
  peakHour?: number; // 0-23
  peakDay?: string; // Mon-Sun
}

export interface PlatformMetrics {
  platform: string;
  views: number;
  engagement: number;
  clickThrough: number;
  avgReadTime: number;
}

export interface CampaignMetrics {
  campaignId: string;
  name: string;
  
  // Overall performance
  totalViews: number;
  totalEngagement: number;
  uniqueVisitors: number;
  conversionRate: number;
  
  // Content performance
  contentCount: number;
  publishedCount: number;
  avgContentPerformance: number;
  topContent: ContentMetrics[];
  
  // Goals
  goals: CampaignGoal[];
  goalsCompleted: number;
  overallProgress: number; // percentage
  
  // Timeline
  startDate: Date;
  endDate?: Date;
  lastActivity: Date;
}

export interface CampaignGoal {
  id: string;
  type: 'views' | 'engagement' | 'conversions' | 'shares';
  target: number;
  current: number;
  progress: number; // percentage
  completedAt?: Date;
}

export interface DashboardMetrics {
  // Period metrics
  period: {
    start: Date;
    end: Date;
    label: string; // "Last 7 days", "This month", etc.
  };
  
  // Overview stats
  overview: {
    totalViews: number;
    uniqueVisitors: number;
    avgReadTime: number;
    totalShares: number;
    engagementRate: number;
    
    // Comparisons to previous period
    viewsChange: number; // percentage
    visitorsChange: number;
    readTimeChange: number;
    sharesChange: number;
  };
  
  // Content performance
  topContent: ContentMetrics[];
  recentlyPublished: ContentMetrics[];
  trending: ContentMetrics[]; // Highest growth rate
  
  // Platform distribution
  platformBreakdown: {
    platform: string;
    percentage: number;
    views: number;
  }[];
  
  // Time-based insights
  trafficPattern: {
    hour: number;
    views: number;
  }[];
  
  // Geographic distribution (privacy-safe)
  topCountries: {
    country: string;
    visitors: number;
    percentage: number;
  }[];
}

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  platforms?: string[];
  contentIds?: string[];
  campaignIds?: string[];
  eventTypes?: AnalyticsEventType[];
}

export interface AnalyticsExport {
  format: 'csv' | 'json' | 'pdf';
  metrics: string[];
  filters: AnalyticsFilter;
  includeCharts?: boolean;
  emailTo?: string;
}

// Real-time event for live dashboard updates
export interface RealtimeAnalyticsEvent {
  type: 'view' | 'engage' | 'publish';
  contentTitle?: string;
  platform?: string;
  location?: string;
  timestamp: Date;
}