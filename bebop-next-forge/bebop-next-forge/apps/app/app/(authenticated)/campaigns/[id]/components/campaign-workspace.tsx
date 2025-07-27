'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import type { 
  Campaign, 
  Content, 
  Schedule, 
  Destination,
  ContentType,
} from '@repo/database/types';
import { 
  ArrowLeft, 
  Calendar, 
  FileText, 
  Settings,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CampaignContent } from './campaign-content';
import { CampaignSchedule } from './campaign-schedule';
import { CampaignOverview } from './campaign-overview';
import { formatDate } from '@/lib/format-date';

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

const statusMapping: Record<string, 'draft' | 'active' | 'paused' | 'completed' | 'archived'> = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const CampaignWorkspace = ({ campaign, destinations }: CampaignWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalContent: campaign.content.length,
    draftContent: campaign.content.filter(c => c.status === 'DRAFT').length,
    readyContent: campaign.content.filter(c => c.status === 'READY').length,
    totalSchedules: campaign.schedules.length,
    pendingSchedules: campaign.schedules.filter(s => s.status === 'PENDING').length,
    publishedSchedules: campaign.schedules.filter(s => s.status === 'PUBLISHED').length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 h-16 px-4 md:px-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{campaign.name}</h1>
              <StatusBadge status={statusMapping[campaign.status]}>
                {campaign.status}
              </StatusBadge>
            </div>
            {campaign.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {campaign.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 md:px-8 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Pieces</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.draftContent} draft, {stats.readyContent} ready
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingSchedules} pending, {stats.publishedSchedules} published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaign Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalContent > 0 ? Math.round((stats.publishedSchedules / stats.totalContent) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Content published
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {campaign.startDate ? formatDate(campaign.startDate) : 'Not set'}
              </div>
              <p className="text-xs text-muted-foreground">
                {campaign.endDate 
                  ? `Ends ${formatDate(campaign.endDate)}`
                  : 'No end date'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content ({stats.totalContent})</TabsTrigger>
            <TabsTrigger value="schedule">Schedule ({stats.totalSchedules})</TabsTrigger>
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