// components/social/EnhancedShareMetrics.tsx
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PlatformId, SocialShareMetrics } from '@/types/social';
import { BlueskyIcon } from './icons/BlueskyIcon';
import { MastodonIcon } from './icons/MastodonIcon';
import { ThreadsIcon } from './icons/ThreadsIcon';

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

export function EnhancedShareMetrics({ metrics }: { metrics: SocialShareMetrics[] }) {
  const stats = useMemo(() => ({
    total: metrics.reduce((sum, m) => sum + m.shareCount, 0),
    byPlatform: metrics.reduce((acc, m) => ({
      ...acc,
      [m.platformId]: (acc[m.platformId] || 0) + m.shareCount
    }), {} as Partial<Record<PlatformId, number>>),
    successRate: metrics.length ? 
      (metrics.reduce((sum, m) => sum + m.successCount, 0) / 
       metrics.reduce((sum, m) => sum + m.shareCount, 0) * 100) : 0
  }), [metrics]);

  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Total Shares</h3>
          <div className="flex space-x-4">
            {Object.entries(stats.byPlatform).map(([platform, count]) => (
              <div key={platform} className="flex items-center space-x-1">
                <PlatformIcon platform={platform as PlatformId} />
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Success Rate</h3>
          <Progress value={stats.successRate} className="h-2" />
          <span className="text-sm text-slate-500">{stats.successRate.toFixed(1)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}