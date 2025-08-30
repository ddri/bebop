import { useState, useCallback, useEffect } from 'react';
import { CampaignMetrics, ContentMetrics, PlatformMetrics } from '@/lib/analytics/types';

export interface CampaignAnalyticsData {
  overview: {
    totalViews: number;
    totalEngagement: number;
    uniqueVisitors: number;
    avgEngagementRate: number;
    totalShares: number;
    totalPublished: number;
  };
  
  performance: {
    daily: Array<{
      date: string;
      views: number;
      engagement: number;
      shares: number;
    }>;
    hourly: Array<{
      hour: number;
      views: number;
    }>;
  };
  
  platforms: Array<{
    platform: string;
    views: number;
    engagement: number;
    shares: number;
    percentage: number;
  }>;
  
  content: {
    topPerforming: ContentMetrics[];
    recentlyPublished: ContentMetrics[];
    needsAttention: ContentMetrics[]; // Low performing content
  };
  
  goals: Array<{
    id: string;
    name: string;
    target: number;
    current: number;
    progress: number;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  label: string;
}

export const useCampaignAnalytics = (campaignId: string, timeRange?: AnalyticsTimeRange) => {
  const [data, setData] = useState<CampaignAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!campaignId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        campaignId,
        ...(timeRange && {
          startDate: timeRange.start.toISOString(),
          endDate: timeRange.end.toISOString()
        })
      });
      
      const response = await fetch(`/api/analytics/campaign?${params}`);
      if (!response.ok) throw new Error('Failed to fetch campaign analytics');
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [campaignId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Export analytics data
  const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const params = new URLSearchParams({
        campaignId,
        format,
        ...(timeRange && {
          startDate: timeRange.start.toISOString(),
          endDate: timeRange.end.toISOString()
        })
      });
      
      const response = await fetch(`/api/analytics/export?${params}`);
      if (!response.ok) throw new Error('Failed to export analytics');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-analytics-${campaignId}-${new Date().toISOString()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Export failed'));
    }
  }, [campaignId, timeRange]);

  // Mock data generator for development
  const generateMockData = useCallback((): CampaignAnalyticsData => {
    const now = new Date();
    const days = 30;
    
    return {
      overview: {
        totalViews: 45234,
        totalEngagement: 8932,
        uniqueVisitors: 12453,
        avgEngagementRate: 19.7,
        totalShares: 1247,
        totalPublished: 24
      },
      
      performance: {
        daily: Array.from({ length: days }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (days - i - 1));
          return {
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 2000) + 500,
            engagement: Math.floor(Math.random() * 400) + 100,
            shares: Math.floor(Math.random() * 50) + 10
          };
        }),
        hourly: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          views: Math.floor(Math.random() * 500) + 50
        }))
      },
      
      platforms: [
        { platform: 'Twitter', views: 15432, engagement: 3241, shares: 543, percentage: 34.1 },
        { platform: 'LinkedIn', views: 12876, engagement: 2876, shares: 423, percentage: 28.5 },
        { platform: 'Facebook', views: 8765, engagement: 1543, shares: 234, percentage: 19.4 },
        { platform: 'Instagram', views: 5432, engagement: 876, shares: 123, percentage: 12.0 },
        { platform: 'Blog', views: 2729, engagement: 396, shares: 47, percentage: 6.0 }
      ],
      
      content: {
        topPerforming: [
          {
            contentId: '1',
            title: 'How to Scale Your SaaS Business',
            type: 'article',
            views: 8453,
            uniqueVisitors: 6234,
            reads: 5432,
            completions: 4321,
            avgReadTime: 234,
            avgScrollDepth: 78,
            shares: 234,
            engagementRate: 72.3,
            platforms: [],
            publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          },
          {
            contentId: '2',
            title: 'The Future of AI in Content Creation',
            type: 'article',
            views: 7234,
            uniqueVisitors: 5432,
            reads: 4532,
            completions: 3765,
            avgReadTime: 198,
            avgScrollDepth: 82,
            shares: 198,
            engagementRate: 68.5,
            platforms: [],
            publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ],
        recentlyPublished: [],
        needsAttention: []
      },
      
      goals: [
        {
          id: '1',
          name: 'Reach 50K views',
          target: 50000,
          current: 45234,
          progress: 90.5,
          status: 'in_progress'
        },
        {
          id: '2',
          name: 'Generate 1000 shares',
          target: 1000,
          current: 1247,
          progress: 124.7,
          status: 'completed'
        },
        {
          id: '3',
          name: '20% engagement rate',
          target: 20,
          current: 19.7,
          progress: 98.5,
          status: 'in_progress'
        }
      ]
    };
  }, []);

  // Use mock data if API not ready
  useEffect(() => {
    if (!data && !loading && campaignId) {
      setData(generateMockData());
    }
  }, [data, loading, campaignId, generateMockData]);

  return {
    data,
    loading,
    error,
    refresh,
    exportData
  };
};

export default useCampaignAnalytics;