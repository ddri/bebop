// components/social/CollectionMetrics.tsx
import React, { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Share, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MiniGraph } from '@/components/ui/mini-graph';
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

export function CollectionMetrics({ metrics }: { metrics: SocialShareMetrics[] }) {
  const [expanded, setExpanded] = useState(false);
  const last7DaysData = [4, 6, 5, 8, 7, 9, 12]; // Example data

  const stats = {
    total: metrics.reduce((sum, m) => sum + m.shareCount, 0),
    byPlatform: metrics.reduce((acc, m) => ({
      ...acc,
      [m.platformId]: (acc[m.platformId] || 0) + m.shareCount
    }), {} as Record<PlatformId, number>),
    successRate: metrics.length ? 
      (metrics.reduce((sum, m) => sum + m.successCount, 0) / 
       metrics.reduce((sum, m) => sum + m.shareCount, 0) * 100) : 0,
    lastShared: metrics.length ? 
      new Date(Math.max(...metrics
        .filter(m => m.lastShared)
        .map(m => m.lastShared ? m.lastShared.getTime() : 0)
      )) : null
  };

  const baseContent = (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Share className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {stats.total} shares
        </span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setExpanded(!expanded)}
        className="h-6 w-6 p-0"
      >
        {expanded ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
        }
      </Button>
    </div>
  );

  if (!expanded) return baseContent;

  return (
    <div className="space-y-4">
      {baseContent}
      
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">
            By Platform
          </h3>
          <div className="space-y-1">
            {Object.entries(stats.byPlatform).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PlatformIcon platform={platform as PlatformId} />
                  <span className="text-sm">{platform}</span>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Success Rate
          </h3>
          <div className="space-y-1">
            <Progress 
              value={stats.successRate} 
              className="h-2"
            />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {stats.successRate.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">7-day trend</span>
            <MiniGraph data={last7DaysData} />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Last shared: {
            stats.lastShared ? 
              stats.lastShared.toLocaleDateString() :
              'Never'
          }</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>+{stats.total} this week</span>
          </div>
        </div>
      </div>
    </div>
  );
}