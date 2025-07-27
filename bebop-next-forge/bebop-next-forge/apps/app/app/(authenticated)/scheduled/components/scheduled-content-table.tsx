'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import type { 
  Schedule, 
  ScheduleStatus,
  ContentType,
  CampaignStatus 
} from '@repo/database/types';
import { 
  Calendar, 
  Clock, 
  Filter,
  MoreHorizontal, 
  Plus,
  ExternalLink,
  Edit
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreateScheduleDialog } from '../../schedule/components/create-schedule-dialog';
import { formatDate, formatTime } from '@/lib/format-date';

interface ScheduledContentTableProps {
  schedules: (Schedule & {
    content: {
      id: string;
      title: string;
      type: ContentType;
      excerpt: string | null;
    };
    campaign: {
      id: string;
      name: string;
      status: CampaignStatus;
    };
    destination: {
      id: string;
      name: string;
      type: string;
    };
  })[];
  campaigns: { id: string; name: string }[];
  destinations: { id: string; name: string; type: string }[];
  filters: {
    status?: string;
    campaign?: string;
    destination?: string;
  };
}

const statusMapping: Record<ScheduleStatus, 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled'> = {
  PENDING: 'pending',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

const campaignStatusMapping: Record<CampaignStatus, 'draft' | 'active' | 'paused' | 'completed' | 'archived'> = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

const typeLabels: Record<ContentType, string> = {
  BLOG_POST: 'Blog Post',
  EMAIL: 'Email',
  SOCIAL_POST: 'Social Post',
  TWITTER: 'Twitter',
  LINKEDIN: 'LinkedIn',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  CUSTOM: 'Custom',
};

export const ScheduledContentTable = ({ 
  schedules, 
  campaigns, 
  destinations, 
  filters 
}: ScheduledContentTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/scheduled?${params.toString()}`);
  };

  const upcomingSchedules = schedules.filter(
    s => s.status === 'PENDING' && new Date(s.publishAt) > new Date()
  );

  const stats = {
    total: schedules.length,
    pending: schedules.filter(s => s.status === 'PENDING').length,
    publishing: schedules.filter(s => s.status === 'PUBLISHING').length,
    published: schedules.filter(s => s.status === 'PUBLISHED').length,
    failed: schedules.filter(s => s.status === 'FAILED').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publishing</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Calendar className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PUBLISHING">Publishing</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.campaign || 'all'} onValueChange={(value) => updateFilter('campaign', value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.destination || 'all'} onValueChange={(value) => updateFilter('destination', value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              {destinations.map((destination) => (
                <SelectItem key={destination.id} value={destination.id}>
                  {destination.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CreateScheduleDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>
        </CreateScheduleDialog>
      </div>

      {/* Upcoming Schedules Quick View */}
      {upcomingSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Next to Publish ({upcomingSchedules.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingSchedules.slice(0, 3).map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-sm">{schedule.content.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {schedule.destination.name} • {typeLabels[schedule.content.type]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatDate(schedule.publishAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(schedule.publishAt)}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingSchedules.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  ...and {upcomingSchedules.length - 3} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Scheduled Content</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Publish Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.content.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {typeLabels[schedule.content.type]}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/campaigns/${schedule.campaign.id}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {schedule.campaign.name}
                          </Link>
                          <StatusBadge status={campaignStatusMapping[schedule.campaign.status]} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{schedule.destination.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.destination.type}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDate(schedule.publishAt)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(schedule.publishAt)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={statusMapping[schedule.status]}>
                          {schedule.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Schedule
                            </DropdownMenuItem>
                            {schedule.status === 'PUBLISHED' && (
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Published
                              </DropdownMenuItem>
                            )}
                            {schedule.status === 'PENDING' && (
                              <DropdownMenuItem>Publish Now</DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              Delete Schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scheduled content</h3>
              <p className="text-muted-foreground mb-4">
                Schedule content from your campaigns to see it here
              </p>
              <CreateScheduleDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Content
                </Button>
              </CreateScheduleDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};