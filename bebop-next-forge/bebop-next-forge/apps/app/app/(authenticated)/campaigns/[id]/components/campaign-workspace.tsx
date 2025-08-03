'use client';

import { formatDate } from '@/lib/format-date';
import type {
  Campaign,
  Content,
  ContentType,
  Destination,
  Schedule,
} from '@repo/database/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@repo/design-system/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Settings,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CampaignContent } from './campaign-content';
import { CampaignOverview } from './campaign-overview';
import { CampaignSchedule } from './campaign-schedule';

interface CampaignWorkspaceProps {
  campaign: Campaign & {
    content: Content[];
    schedules: (Schedule & {
      content: {
        id: string;
        title: string;
        type: ContentType;
      };
      destination: {
        id: string;
        name: string;
        type: string;
      };
    })[];
  };
  destinations: Destination[];
}

const statusMapping: Record<
  string,
  'draft' | 'active' | 'paused' | 'completed' | 'archived'
> = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const CampaignWorkspace = ({
  campaign,
  destinations,
}: CampaignWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalContent: campaign.content.length,
    draftContent: campaign.content.filter((c) => c.status === 'DRAFT').length,
    readyContent: campaign.content.filter((c) => c.status === 'READY').length,
    totalSchedules: campaign.schedules.length,
    pendingSchedules: campaign.schedules.filter((s) => s.status === 'PENDING')
      .length,
    publishedSchedules: campaign.schedules.filter(
      (s) => s.status === 'PUBLISHED'
    ).length,
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-4 md:px-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-xl">{campaign.name}</h1>
              <StatusBadge status={statusMapping[campaign.status]}>
                {campaign.status}
              </StatusBadge>
            </div>
            {campaign.description && (
              <p className="mt-1 text-muted-foreground text-sm">
                {campaign.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6 md:px-8">
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                {stats.draftContent} draft, {stats.readyContent} ready
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
                {stats.pendingSchedules} pending, {stats.publishedSchedules}{' '}
                published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Campaign Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {stats.totalContent > 0
                  ? Math.round(
                      (stats.publishedSchedules / stats.totalContent) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-muted-foreground text-xs">Content published</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Timeline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-sm">
                {campaign.startDate
                  ? formatDate(campaign.startDate)
                  : 'Not set'}
              </div>
              <p className="text-muted-foreground text-xs">
                {campaign.endDate
                  ? `Ends ${formatDate(campaign.endDate)}`
                  : 'No end date'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">
              Content ({stats.totalContent})
            </TabsTrigger>
            <TabsTrigger value="schedule">
              Schedule ({stats.totalSchedules})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CampaignOverview campaign={campaign} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <CampaignContent campaign={campaign} />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <CampaignSchedule campaign={campaign} destinations={destinations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
