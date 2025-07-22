'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Timer,
  TrendingUp
} from 'lucide-react';

interface SchedulerStatusCardsProps {
  statistics: {
    pending: number;
    publishing: number;
    published: number;
    failed: number;
    total: number;
  };
  lastUpdate?: string;
}

export const SchedulerStatusCards = ({ statistics, lastUpdate }: SchedulerStatusCardsProps) => {
  const cards = [
    {
      title: 'Pending',
      value: statistics.pending,
      icon: Clock,
      description: 'Scheduled for publishing',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      title: 'Publishing',
      value: statistics.publishing,
      icon: Activity,
      description: 'Currently being published',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Published',
      value: statistics.published,
      icon: CheckCircle,
      description: 'Successfully published',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Failed',
      value: statistics.failed,
      icon: AlertTriangle,
      description: 'Require attention',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
    },
  ];

  const successRate = statistics.total > 0 
    ? ((statistics.published / statistics.total) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Main Status Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold">
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </div>
                  <div className={`rounded-full p-3 ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Schedules
                </p>
                <p className="text-2xl font-bold">
                  {statistics.total}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  All time total
                </p>
              </div>
              <div className="rounded-full p-3 bg-gray-50 dark:bg-gray-950/30">
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </p>
                <p className="text-2xl font-bold">
                  {successRate}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Published vs total
                </p>
              </div>
              <div className={`rounded-full p-3 ${
                parseFloat(successRate) >= 90 
                  ? 'bg-green-50 dark:bg-green-950/30' 
                  : parseFloat(successRate) >= 70 
                  ? 'bg-yellow-50 dark:bg-yellow-950/30' 
                  : 'bg-red-50 dark:bg-red-950/30'
              }`}>
                <CheckCircle className={`h-5 w-5 ${
                  parseFloat(successRate) >= 90 
                    ? 'text-green-600' 
                    : parseFloat(successRate) >= 70 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Queue Status
                </p>
                <p className="text-2xl font-bold">
                  {statistics.pending + statistics.publishing > 0 ? 'Active' : 'Idle'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lastUpdate ? `Updated ${new Date(lastUpdate).toLocaleTimeString()}` : 'Status unknown'}
                </p>
              </div>
              <div className={`rounded-full p-3 ${
                statistics.pending + statistics.publishing > 0 
                  ? 'bg-blue-50 dark:bg-blue-950/30' 
                  : 'bg-gray-50 dark:bg-gray-950/30'
              }`}>
                <Timer className={`h-5 w-5 ${
                  statistics.pending + statistics.publishing > 0 
                    ? 'text-blue-600' 
                    : 'text-gray-600'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};