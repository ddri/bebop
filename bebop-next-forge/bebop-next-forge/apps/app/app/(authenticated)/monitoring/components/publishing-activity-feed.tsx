'use client';

import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { EmptyState } from '@repo/design-system/components/ui/empty-state';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface PublishingActivity {
  id: string;
  status: string;
  publishAt: string;
  publishedAt?: string;
  attempts: number;
  error?: string;
  content: { title: string };
  destination: { name: string; type: string };
}

interface PublishingActivityFeedProps {
  activities: PublishingActivity[];
  onRefresh: () => void;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'PUBLISHED':
      return {
        badge: 'active' as const,
        icon: CheckCircle,
        color: 'text-green-600',
      };
    case 'FAILED':
      return {
        badge: 'archived' as const,
        icon: AlertTriangle,
        color: 'text-red-600',
      };
    case 'PENDING':
      return {
        badge: 'draft' as const,
        icon: Clock,
        color: 'text-yellow-600',
      };
    case 'PUBLISHING':
      return {
        badge: 'ready' as const,
        icon: Activity,
        color: 'text-blue-600',
      };
    default:
      return {
        badge: 'draft' as const,
        icon: Clock,
        color: 'text-gray-600',
      };
  }
};

const getPlatformColor = (type: string) => {
  switch (type) {
    case 'HASHNODE':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'DEVTO':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    case 'BLUESKY':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300';
    case 'MASTODON':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export const PublishingActivityFeed = ({
  activities,
  onRefresh,
}: PublishingActivityFeedProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            variant="inline"
            size="sm"
            icon={Activity}
            title="No recent activity"
            description="Publishing activity will appear here"
          />
        ) : (
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {activities.map((activity) => {
              const statusConfig = getStatusConfig(activity.status);
              const Icon = statusConfig.icon;
              const timeAgo = activity.publishedAt
                ? formatDistanceToNow(new Date(activity.publishedAt), {
                    addSuffix: true,
                  })
                : formatDistanceToNow(new Date(activity.publishAt), {
                    addSuffix: true,
                  });

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    className={`rounded-full p-1.5 ${statusConfig.color === 'text-green-600' ? 'bg-green-50 dark:bg-green-950/30' : statusConfig.color === 'text-red-600' ? 'bg-red-50 dark:bg-red-950/30' : statusConfig.color === 'text-yellow-600' ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-blue-50 dark:bg-blue-950/30'}`}
                  >
                    <Icon className={`h-4 w-4 ${statusConfig.color}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {activity.content.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPlatformColor(activity.destination.type)}`}
                          >
                            {activity.destination.name}
                          </Badge>
                          <StatusBadge status={statusConfig.badge}>
                            {activity.status}
                          </StatusBadge>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">
                          {timeAgo}
                        </p>
                        {activity.attempts > 1 && (
                          <p className="mt-1 text-xs text-yellow-600">
                            Attempt {activity.attempts}/3
                          </p>
                        )}
                      </div>
                    </div>

                    {activity.error && (
                      <div className="mt-2 rounded bg-red-50 p-2 text-red-700 text-xs dark:bg-red-950/30 dark:text-red-300">
                        <p className="font-medium">Error:</p>
                        <p className="mt-1">{activity.error}</p>
                      </div>
                    )}

                    {activity.status === 'PUBLISHED' && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-xs"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Published Content
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
