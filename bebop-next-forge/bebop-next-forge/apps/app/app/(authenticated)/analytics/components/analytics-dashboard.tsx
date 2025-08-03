'use client';

import { getStatusColor } from '@repo/design-system';
import { Badge } from '@repo/design-system/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  Activity,
  BarChart3,
  Calendar,
  Clock,
  FileText,
  Globe,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalContent: number;
    publishedContent: number;
    totalSchedules: number;
    publishedSchedules: number;
    activeDestinations: number;
    contentByType: Record<string, number>;
    campaignsByStatus: Record<string, number>;
    recentContent: Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      campaign: {
        name: string;
      };
      createdAt: Date;
    }>;
    recentSchedules: Array<{
      id: string;
      publishAt: Date;
      status: string;
      content: {
        title: string;
        type: string;
      };
      destination: {
        name: string;
        type: string;
      };
    }>;
  };
}

export const AnalyticsDashboard = ({ stats }: AnalyticsDashboardProps) => {
  const contentTypeLabels: Record<string, string> = {
    BLOG_POST: 'Blog Posts',
    EMAIL: 'Emails',
    SOCIAL_POST: 'Social Posts',
    TWITTER: 'Twitter',
    LINKEDIN: 'LinkedIn',
    INSTAGRAM: 'Instagram',
    FACEBOOK: 'Facebook',
    CUSTOM: 'Custom',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your content marketing performance and activity
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Total Campaigns
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalCampaigns}</div>
            <p className="text-muted-foreground text-xs">
              {stats.activeCampaigns} active campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Content Pieces
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalContent}</div>
            <p className="text-muted-foreground text-xs">
              {stats.publishedContent} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Scheduled Posts
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalSchedules}</div>
            <p className="text-muted-foreground text-xs">
              {stats.publishedSchedules} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Active Destinations
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.activeDestinations}</div>
            <p className="text-muted-foreground text-xs">
              Publishing platforms
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Content by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.contentByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {contentTypeLabels[type] || type}
                  </span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
              {Object.keys(stats.contentByType).length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No content created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaigns by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.campaignsByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium text-sm">{status}</span>
                    <Badge
                      className={
                        getStatusColor(status as keyof typeof getStatusColor) ||
                        'bg-muted text-muted-foreground'
                      }
                    >
                      {count}
                    </Badge>
                  </div>
                )
              )}
              {Object.keys(stats.campaignsByStatus).length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No campaigns created yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Publishing Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Publishing Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Success Rate</span>
                <Badge className="bg-success/10 text-success">
                  {stats.totalSchedules > 0
                    ? Math.round(
                        (stats.publishedSchedules / stats.totalSchedules) * 100
                      )
                    : 0}
                  %
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Published</span>
                <Badge variant="outline">{stats.publishedSchedules}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Pending</span>
                <Badge variant="outline">
                  {stats.totalSchedules - stats.publishedSchedules}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4" />
              Recent Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentContent.length > 0 ? (
                stats.recentContent.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="truncate font-medium text-sm">
                        {content.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {content.campaign.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {content.type.replace('_', ' ')}
                      </Badge>
                      <Badge
                        className={
                          getStatusColor(
                            content.status as keyof typeof getStatusColor
                          ) || 'bg-muted text-muted-foreground'
                        }
                      >
                        {content.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No recent content
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4" />
              Recent Schedules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentSchedules.length > 0 ? (
                stats.recentSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="truncate font-medium text-sm">
                        {schedule.content.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {schedule.destination.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(schedule.publishAt).toLocaleDateString()}
                      </Badge>
                      <Badge
                        className={
                          getStatusColor(
                            schedule.status as keyof typeof getStatusColor
                          ) || 'bg-muted text-muted-foreground'
                        }
                      >
                        {schedule.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No recent schedules
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
