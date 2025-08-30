'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Share2, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { ContentMetrics } from '@/lib/analytics/types';

interface ContentPerformanceTableProps {
  content: ContentMetrics[];
  showAlert?: boolean;
}

export const ContentPerformanceTable: React.FC<ContentPerformanceTableProps> = ({
  content,
  showAlert = false
}) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDaysAgo = (date: Date): string => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No content data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showAlert && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            These content pieces are performing below average and may benefit from optimization or re-promotion.
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-3 font-medium">Content</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Published</th>
              <th className="pb-3 font-medium text-center">Views</th>
              <th className="pb-3 font-medium text-center">Engagement</th>
              <th className="pb-3 font-medium text-center">Avg. Read Time</th>
              <th className="pb-3 font-medium text-center">Shares</th>
              <th className="pb-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {content.map((item) => (
              <tr key={item.contentId} className="hover:bg-muted/50 transition-colors">
                <td className="py-3">
                  <div className="max-w-sm">
                    <p className="font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.platforms.slice(0, 3).map((platform) => (
                        <Badge key={platform.platform} variant="secondary" className="text-xs">
                          {platform.platform}
                        </Badge>
                      ))}
                      {item.platforms.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{item.platforms.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <Badge variant="outline" className="capitalize">
                    {item.type}
                  </Badge>
                </td>
                <td className="py-3 text-sm text-muted-foreground">
                  {item.publishedAt && getDaysAgo(item.publishedAt)}
                </td>
                <td className="py-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{item.views.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.uniqueVisitors.toLocaleString()} unique
                    </span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{item.engagementRate.toFixed(1)}%</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.reads} reads
                    </span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{formatDuration(item.avgReadTime)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.avgScrollDepth.toFixed(0)}% scroll
                    </span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Share2 className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium">{item.shares}</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};