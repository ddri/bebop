// components/social/ShareMetricsDisplay.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BlueskyIcon } from './icons/BlueskyIcon';
import { MastodonIcon } from './icons/MastodonIcon';
import { ThreadsIcon } from './icons/ThreadsIcon';
import { PlatformId, SocialShareMetrics } from '@/types/social';

interface ShareMetricsDisplayProps {
  metrics: SocialShareMetrics[];
}

const PlatformIcon = ({ platform }: { platform: PlatformId }) => {
  switch (platform) {
    case 'bluesky':
      return <BlueskyIcon className="h-4 w-4" />;
    case 'mastodon':
      return <MastodonIcon className="h-4 w-4" />;
    case 'threads':
      return <ThreadsIcon className="h-4 w-4" />;
    default:
      return null;
  }
};

export function ShareMetricsDisplay({ metrics }: ShareMetricsDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate stats
  const stats = {
    totalShares: metrics.reduce((sum, m) => sum + m.shareCount, 0),
    byPlatform: metrics.reduce((acc, m) => ({
      ...acc,
      [m.platformId]: {
        shares: m.shareCount,
        success: m.successCount,
        failures: m.failureCount
      }
    }), {} as Record<PlatformId, { shares: number; success: number; failures: number }>),
    successRate: metrics.length > 0 ? 
      (metrics.reduce((sum, m) => sum + m.successCount, 0) / 
       metrics.reduce((sum, m) => sum + m.shareCount, 0) * 100) : 0,
    lastShared: metrics.length > 0 ? 
      new Date(Math.max(...metrics
        .filter(m => m.lastShared)
        .map(m => m.lastShared ? new Date(m.lastShared).getTime() : 0)
      )) : null
  };

  const platformNames = {
    bluesky: 'Bluesky',
    mastodon: 'Mastodon',
    threads: 'Threads'
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Share Metrics</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="h-8 w-8 p-0"
        >
          {expanded ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </Button>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Shares</span>
            <span className="text-2xl font-bold">{stats.totalShares}</span>
          </div>

          {expanded && (
            <>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 text-sm font-medium">Success Rate</div>
                  <Progress 
                    value={stats.successRate} 
                    className="h-2"
                  />
                  <div className="mt-1 text-sm text-slate-500">
                    {stats.successRate.toFixed(1)}% successful shares
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">By Platform</div>
                  <div className="space-y-2">
                    {Object.entries(stats.byPlatform).map(([platform, data]) => (
                      <div key={platform} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <PlatformIcon platform={platform as PlatformId} />
                          <span className="text-sm">{platformNames[platform as PlatformId]}</span>
                        </div>
                        <div className="text-sm space-x-4">
                          <span>{data.shares} shares</span>
                          <span className="text-green-500">{data.success} successful</span>
                          {data.failures > 0 && (
                            <span className="text-red-500">{data.failures} failed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {stats.lastShared && (
                  <div className="text-sm text-slate-500">
                    Last shared: {stats.lastShared.toLocaleDateString()} at{' '}
                    {stats.lastShared.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}