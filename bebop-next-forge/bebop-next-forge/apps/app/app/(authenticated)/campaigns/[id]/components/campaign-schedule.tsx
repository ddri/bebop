'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import type { 
  Campaign, 
  Schedule, 
  Destination,
  ContentType,
  ScheduleStatus 
} from '@repo/database/types';
import { Calendar, Plus, Clock, ExternalLink, MoreHorizontal } from 'lucide-react';
import { CreateScheduleDialog } from '../../../schedule/components/create-schedule-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';

interface CampaignScheduleProps {
  campaign: Campaign & {
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

const statusMapping: Record<ScheduleStatus, 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled'> = {
  PENDING: 'pending',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const CampaignSchedule = ({ campaign, destinations }: CampaignScheduleProps) => {
  const upcomingSchedules = campaign.schedules.filter(
    s => s.status === 'PENDING' && new Date(s.publishAt) > new Date()
  );
  
  const recentSchedules = campaign.schedules.filter(
    s => s.status === 'PUBLISHED' || s.status === 'FAILED'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Publishing Schedule</h2>
          <p className="text-sm text-muted-foreground">
            Schedule content for {campaign.name} across your destinations
          </p>
        </div>
        <CreateScheduleDialog campaignId={campaign.id}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>
        </CreateScheduleDialog>
      </div>

      {campaign.schedules.length > 0 ? (
        <div className="space-y-6">
          {/* Upcoming Schedules */}
          {upcomingSchedules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Publications ({upcomingSchedules.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Publish Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingSchedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{schedule.content.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {schedule.content.type.replace('_', ' ').toLowerCase()}
                              </div>
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
                                {new Date(schedule.publishAt).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(schedule.publishAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
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
                                <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
                                <DropdownMenuItem>Publish Now</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  Cancel Schedule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Schedules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                All Scheduled Content ({campaign.schedules.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{schedule.content.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {schedule.content.type.replace('_', ' ').toLowerCase()}
                            </div>
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
                              {new Date(schedule.publishAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(schedule.publishAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
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
                              <DropdownMenuItem>Edit Schedule</DropdownMenuItem>
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
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Schedule content from your {campaign.name} campaign to publish across your destinations.
            </p>
            <CreateScheduleDialog campaignId={campaign.id}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Content
              </Button>
            </CreateScheduleDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};