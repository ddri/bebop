'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Progress } from '@repo/design-system/components/ui/progress';
import type { Campaign, Content, Schedule } from '@repo/database/types';
import { Calendar, FileText, Target, TrendingUp } from 'lucide-react';

interface CampaignOverviewProps {
  campaign: Campaign & {
    content: Content[];
    schedules: Schedule[];
  };
}

export const CampaignOverview = ({ campaign }: CampaignOverviewProps) => {
  const contentByType = campaign.content.reduce((acc, content) => {
    acc[content.type] = (acc[content.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const schedulesByStatus = campaign.schedules.reduce((acc, schedule) => {
    acc[schedule.status] = (acc[schedule.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completionRate = campaign.content.length > 0 
    ? Math.round((schedulesByStatus.PUBLISHED || 0) / campaign.content.length * 100)
    : 0;

  const upcomingSchedules = campaign.schedules
    .filter(s => s.status === 'PENDING' && new Date(s.publishAt) > new Date())
    .sort((a, b) => new Date(a.publishAt).getTime() - new Date(b.publishAt).getTime())
    .slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm mt-1">{campaign.description || 'No description provided'}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Start Date</label>
              <p className="text-sm mt-1">
                {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">End Date</label>
              <p className="text-sm mt-1">
                {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Campaign Progress</label>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Content Published</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(contentByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="text-sm text-muted-foreground">{count}</span>
              </div>
            ))}
            {Object.keys(contentByType).length === 0 && (
              <p className="text-sm text-muted-foreground">No content created yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Publishing Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(schedulesByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {status.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="text-sm text-muted-foreground">{count}</span>
              </div>
            ))}
            {Object.keys(schedulesByStatus).length === 0 && (
              <p className="text-sm text-muted-foreground">No content scheduled yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Publications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Publications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingSchedules.map((schedule) => (
              <div key={schedule.id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Publishing soon</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(schedule.publishAt).toLocaleDateString()} at{' '}
                    {new Date(schedule.publishAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {upcomingSchedules.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming publications</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};