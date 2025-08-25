'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Clock, 
  Share2, 
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  RefreshCw
} from 'lucide-react';
import { DashboardMetrics } from '@/lib/analytics/types';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function MetricCard({ title, value, change, icon, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card className="bg-[#2f2f2d] border-slate-700">
        <CardContent className="p-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  const changeIcon = change !== undefined && change !== 0 ? (
    change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
  ) : <Minus className="w-3 h-3" />;
  
  const changeColor = change !== undefined && change !== 0 ? (
    change > 0 ? 'text-green-400' : 'text-red-400'
  ) : 'text-slate-400';

  return (
    <Card className="bg-[#2f2f2d] border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">{title}</span>
          <span className="text-slate-500">{icon}</span>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
            {changeIcon}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [period]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/metrics?type=dashboard&days=${period}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics...');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTime = (seconds: number): string => {
    if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-[#1c1c1e] border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#E669E8]" />
                Analytics Overview
              </CardTitle>
              <CardDescription className="text-slate-300 mt-1">
                Track your content performance and audience engagement
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="bg-[#2f2f2d] border-slate-700 text-white w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2f2f2d] border-slate-700">
                  <SelectItem value="1" className="text-white">Today</SelectItem>
                  <SelectItem value="7" className="text-white">Last 7 days</SelectItem>
                  <SelectItem value="30" className="text-white">Last 30 days</SelectItem>
                  <SelectItem value="90" className="text-white">Last 3 months</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-slate-700 text-slate-300"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-slate-700 text-slate-300"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={metrics ? formatNumber(metrics.overview.totalViews) : '-'}
          change={metrics?.overview.viewsChange}
          icon={<Eye className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Unique Visitors"
          value={metrics ? formatNumber(metrics.overview.uniqueVisitors) : '-'}
          change={metrics?.overview.visitorsChange}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Avg. Read Time"
          value={metrics ? formatTime(metrics.overview.avgReadTime) : '-'}
          change={metrics?.overview.readTimeChange}
          icon={<Clock className="h-4 w-4" />}
          loading={loading}
        />
        <MetricCard
          title="Total Shares"
          value={metrics ? formatNumber(metrics.overview.totalShares) : '-'}
          change={metrics?.overview.sharesChange}
          icon={<Share2 className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Pattern */}
        <Card className="bg-[#2f2f2d] border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Traffic Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="h-[200px] flex items-end gap-1">
                {metrics?.trafficPattern.map((hour) => {
                  const maxViews = Math.max(...(metrics?.trafficPattern.map(h => h.views) || [1]));
                  const height = (hour.views / maxViews) * 100;
                  return (
                    <div
                      key={hour.hour}
                      className="flex-1 bg-[#E669E8]/20 hover:bg-[#E669E8]/40 transition-colors relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {hour.hour}:00 - {hour.views} views
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="bg-[#2f2f2d] border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Platform Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <div className="space-y-3">
                {metrics?.platformBreakdown.slice(0, 5).map((platform) => (
                  <div key={platform.platform} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{platform.platform}</span>
                      <span className="text-slate-400">{formatNumber(platform.views)} views</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-[#E669E8] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <Card className="bg-[#2f2f2d] border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">Top Performing Content</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : metrics?.topContent.length ? (
            <div className="space-y-2">
              {metrics.topContent.slice(0, 5).map((content, index) => (
                <div
                  key={content.contentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-500">#{index + 1}</span>
                    <div>
                      <div className="text-white font-medium">{content.title}</div>
                      <div className="text-xs text-slate-400">
                        {formatNumber(content.views)} views • {content.engagementRate.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                  {content.views > 1000 && (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No content data available yet</p>
              <p className="text-sm mt-1">Publish content to see analytics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      {metrics?.topCountries.length ? (
        <Card className="bg-[#2f2f2d] border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {metrics.topCountries.slice(0, 5).map((country) => (
                <div key={country.country} className="text-center">
                  <div className="text-2xl mb-1">{getCountryFlag(country.country)}</div>
                  <div className="text-sm text-white">{country.country}</div>
                  <div className="text-xs text-slate-400">
                    {country.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'JP': '🇯🇵',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'NL': '🇳🇱',
  };
  return flags[countryCode] || '🌍';
}