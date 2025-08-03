'use client';

import type { DestinationType } from '@repo/database/types';
import {
  backgroundColors,
  destructiveAction,
  getPlatformColor,
  iconColors,
} from '@repo/design-system';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { EmptyState } from '@repo/design-system/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface FailedSchedule {
  id: string;
  status: string;
  publishAt: string;
  publishedAt?: string;
  attempts: number;
  error?: string;
  content: { title: string };
  destination: { name: string; type: string };
}

interface FailedSchedulesManagerProps {
  failedActivities: FailedSchedule[];
  onRetry: () => void;
}

export const FailedSchedulesManager = ({
  failedActivities,
  onRetry,
}: FailedSchedulesManagerProps) => {
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

  const handleRetrySchedule = async (scheduleId: string) => {
    setRetryingIds((prev) => new Set([...prev, scheduleId]));

    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retrySchedule',
          scheduleId,
        }),
      });

      if (response.ok) {
        // Refresh data after retry
        setTimeout(() => onRetry(), 1000);
      }
    } catch (_error) {
    } finally {
      setRetryingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(scheduleId);
        return newSet;
      });
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancelSchedule',
          scheduleId,
        }),
      });

      if (response.ok) {
        // Refresh data after cancellation
        setTimeout(() => onRetry(), 1000);
      }
    } catch (_error) {}
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${iconColors.error}`} />
            Failed Schedules
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {failedActivities.length} Failed
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {failedActivities.length === 0 ? (
          <EmptyState
            variant="inline"
            size="sm"
            icon={AlertTriangle}
            title="No failed schedules"
            description="All schedules are publishing successfully"
          />
        ) : (
          <div className="max-h-96 space-y-4 overflow-y-auto">
            {failedActivities.map((schedule) => {
              const isRetrying = retryingIds.has(schedule.id);
              const timeAgo = formatDistanceToNow(
                new Date(schedule.publishAt),
                { addSuffix: true }
              );
              const maxAttemptsReached = schedule.attempts >= 3;

              return (
                <div
                  key={schedule.id}
                  className={`rounded-lg border p-4 ${backgroundColors.error}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${iconColors.error} flex-shrink-0`}
                        />
                        <p className="truncate font-medium text-sm">
                          {schedule.content.title}
                        </p>
                      </div>

                      <div className="mb-3 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPlatformColor(schedule.destination.type as DestinationType)}`}
                        >
                          {schedule.destination.name}
                        </Badge>
                        <Badge variant="destructive" className="text-xs">
                          Attempt {schedule.attempts}/3
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Calendar className="h-3 w-3" />
                          {timeAgo}
                        </div>
                      </div>

                      {schedule.error && (
                        <div
                          className={`mb-3 p-2 ${backgroundColors.error} rounded text-xs`}
                        >
                          <p className={`font-medium ${iconColors.error} mb-1`}>
                            Error Details:
                          </p>
                          <p className={iconColors.error}>{schedule.error}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetrySchedule(schedule.id)}
                          disabled={isRetrying || maxAttemptsReached}
                          className="h-7 text-xs"
                        >
                          {isRetrying ? (
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="mr-1 h-3 w-3" />
                          )}
                          {maxAttemptsReached
                            ? 'Max Attempts'
                            : isRetrying
                              ? 'Retrying...'
                              : 'Retry'}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSchedule(schedule.id)}
                          className={`h-7 text-xs ${destructiveAction.button}`}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Cancel
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-7 text-xs"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Content
                        </Button>
                      </div>
                    </div>
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
