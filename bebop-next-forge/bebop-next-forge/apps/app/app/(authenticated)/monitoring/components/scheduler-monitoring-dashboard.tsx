'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Timer,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { SchedulerStatusCards } from './scheduler-status-cards';
import { PublishingActivityFeed } from './publishing-activity-feed';
import { FailedSchedulesManager } from './failed-schedules-manager';

interface SchedulerHealth {
  status: string;
  timestamp: string;
  statistics: {
    pending: number;
    publishing: number;
    published: number;
    failed: number;
    total: number;
  };
  recentActivity: Array<{
    id: string;
    status: string;
    publishAt: string;
    publishedAt?: string;
    attempts: number;
    error?: string;
    content: { title: string };
    destination: { name: string; type: string };
  }>;
}

export const SchedulerMonitoringDashboard = () => {
  const [health, setHealth] = useState<SchedulerHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/scheduler?action=health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch scheduler health:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualCheck = async () => {
    try {
      const response = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkPending' })
      });
      
      if (response.ok) {
        // Refresh data after manual check
        setTimeout(() => fetchHealth(), 1000);
      }
    } catch (error) {
      console.error('Failed to trigger manual check:', error);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !health) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 h-16 px-4 md:px-8 border-b">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Publishing Queue Monitor</h1>
            <p className="text-muted-foreground">
              Real-time monitoring of content publishing operations
            </p>
          </div>
        </div>
        
        <div className="px-4 md:px-8 py-6 flex-1">
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = health?.statistics || {
    pending: 0,
    publishing: 0,
    published: 0,
    failed: 0,
    total: 0
  };

  const recentActivity = health?.recentActivity || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 h-16 px-4 md:px-8 border-b">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Publishing Queue Monitor</h1>
            <StatusBadge status={health?.status === 'healthy' ? 'active' : 'draft'}>
              {health?.status || 'Unknown'}
            </StatusBadge>
          </div>
          <p className="text-muted-foreground">
            Real-time monitoring of content publishing operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHealth}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={triggerManualCheck}
          >
            <Zap className="h-4 w-4 mr-2" />
            Check Now
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 flex-1 overflow-auto">
        {/* Status Overview Cards */}
        <SchedulerStatusCards 
          statistics={stats} 
          lastUpdate={health?.timestamp} 
        />

        {/* Activity Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mt-8">
          {/* Publishing Activity Feed */}
          <PublishingActivityFeed 
            activities={recentActivity}
            onRefresh={fetchHealth}
          />

          {/* Failed Schedules Manager */}
          <FailedSchedulesManager 
            failedActivities={recentActivity.filter(a => a.status === 'FAILED')}
            onRetry={fetchHealth}
          />
        </div>
      </div>
    </div>
  );
};