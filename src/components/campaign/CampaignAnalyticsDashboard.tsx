'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Share2, 
  Download,
  RefreshCw,
  Calendar,
  Target,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useCampaignAnalytics, AnalyticsTimeRange } from '@/hooks/useCampaignAnalytics';
import { PerformanceChart } from './analytics/PerformanceChart';
import { PlatformBreakdown } from './analytics/PlatformBreakdown';
import { ContentPerformanceTable } from './analytics/ContentPerformanceTable';
import { GoalsProgress } from './analytics/GoalsProgress';
import { EngagementHeatmap } from './analytics/EngagementHeatmap';
import { MetricCard } from './analytics/MetricCard';

interface CampaignAnalyticsDashboardProps {
  campaignId: string;
  campaignName: string;
}

const TIME_RANGES: Array<{ label: string; days: number }> = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time', days: 365 }
];

export const CampaignAnalyticsDashboard: React.FC<CampaignAnalyticsDashboardProps> = ({
  campaignId,
  campaignName
}) => {
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[1]); // Default to 30 days
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  
  const timeRange: AnalyticsTimeRange = {
    start: new Date(Date.now() - selectedRange.days * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: selectedRange.label
  };
  
  const { data, loading, error, refresh, exportData } = useCampaignAnalytics(campaignId, timeRange);

  const handleExport = async () => {
    await exportData(exportFormat);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center text-green-500 text-sm">
          <ArrowUp className="w-3 h-3 mr-1" />
          {Math.abs(change)}%
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <ArrowDown className="w-3 h-3 mr-1" />
          {Math.abs(change)}%
        </div>
      );
    }
    return null;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm text-destructive">
            Failed to load analytics: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Analytics</h2>
          <p className="text-muted-foreground">{campaignName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.label}
                size="sm"
                variant={selectedRange.label === range.label ? 'default' : 'ghost'}
                onClick={() => setSelectedRange(range)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
          
          {/* Actions */}
          <Button size="sm" variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <div className="flex gap-1">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf')}
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF</option>
            </select>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Views"
          value={formatNumber(data.overview.totalViews)}
          icon={Eye}
          change={12.5}
        />
        <MetricCard
          title="Unique Visitors"
          value={formatNumber(data.overview.uniqueVisitors)}
          icon={Users}
          change={8.3}
        />
        <MetricCard
          title="Engagement"
          value={formatNumber(data.overview.totalEngagement)}
          icon={TrendingUp}
          change={-2.1}
        />
        <MetricCard
          title="Engagement Rate"
          value={`${data.overview.avgEngagementRate.toFixed(1)}%`}
          icon={BarChart3}
          change={5.7}
        />
        <MetricCard
          title="Total Shares"
          value={formatNumber(data.overview.totalShares)}
          icon={Share2}
          change={15.2}
        />
        <MetricCard
          title="Published"
          value={data.overview.totalPublished.toString()}
          icon={Calendar}
          change={0}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>
                Views, engagement, and shares for {selectedRange.label.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={data.performance.daily} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hourly Traffic Pattern</CardTitle>
              <CardDescription>
                Average views by hour of day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EngagementHeatmap data={data.performance.hourly} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>
                Distribution of views and engagement across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformBreakdown platforms={data.platforms} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>
                Your best performing content based on views and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentPerformanceTable content={data.content.topPerforming} />
            </CardContent>
          </Card>
          
          {data.content.needsAttention.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Content Needing Attention</CardTitle>
                <CardDescription>
                  Content with below-average performance that may need optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContentPerformanceTable content={data.content.needsAttention} showAlert />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Funnel</CardTitle>
                <CardDescription>
                  User journey from view to completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Views</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-[#E669E8] h-3 rounded-full" style={{ width: '100%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Reads</span>
                    <span className="font-medium">64%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-[#E669E8] h-3 rounded-full" style={{ width: '64%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Completions</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-[#E669E8] h-3 rounded-full" style={{ width: '42%' }} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Shares</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-[#E669E8] h-3 rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Metrics</CardTitle>
                <CardDescription>
                  Key engagement indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg. Read Time</span>
                    <span className="text-xl font-semibold">3m 24s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg. Scroll Depth</span>
                    <span className="text-xl font-semibold">76%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bounce Rate</span>
                    <span className="text-xl font-semibold">32%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Share Rate</span>
                    <span className="text-xl font-semibold">2.8%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <GoalsProgress goals={data.goals} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignAnalyticsDashboard;