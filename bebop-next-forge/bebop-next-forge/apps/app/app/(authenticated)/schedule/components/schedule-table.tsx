'use client';

import type {
  ContentType,
  DestinationType,
  Schedule,
  ScheduleStatus,
} from '@repo/database/types';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { EmptyState } from '@repo/design-system/components/ui/empty-state';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/ui/table';
import { Calendar, Clock, MoreHorizontal, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateScheduleDialog } from './create-schedule-dialog';
import { EditScheduleDialog } from './edit-schedule-dialog';

interface ScheduleTableProps {
  schedules: (Schedule & {
    content: {
      id: string;
      title: string;
      type: ContentType;
    };
    campaign: {
      id: string;
      name: string;
    };
    destination: {
      id: string;
      name: string;
      type: DestinationType;
    };
  })[];
}

const statusMapping: Record<
  ScheduleStatus,
  'pending' | 'publishing' | 'published' | 'failed' | 'cancelled'
> = {
  PENDING: 'pending',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

const typeColors: Record<ContentType, string> = {
  BLOG_POST: 'bg-purple-100 text-purple-800',
  EMAIL: 'bg-orange-100 text-orange-800',
  SOCIAL_POST: 'bg-pink-100 text-pink-800',
  TWITTER: 'bg-blue-100 text-blue-800',
  LINKEDIN: 'bg-blue-100 text-blue-800',
  INSTAGRAM: 'bg-pink-100 text-pink-800',
  FACEBOOK: 'bg-blue-100 text-blue-800',
  CUSTOM: 'bg-gray-100 text-gray-800',
};

const destinationColors: Record<DestinationType, string> = {
  // Phase 1 Platforms
  HASHNODE: 'bg-blue-100 text-blue-800',
  DEVTO: 'bg-black-100 text-black-800',
  BLUESKY: 'bg-sky-100 text-sky-800',
  MASTODON: 'bg-purple-100 text-purple-800',
  // Future Platforms
  WORDPRESS: 'bg-blue-100 text-blue-800',
  GHOST: 'bg-gray-100 text-gray-800',
  MAILCHIMP: 'bg-yellow-100 text-yellow-800',
  SENDGRID: 'bg-blue-100 text-blue-800',
  TWITTER: 'bg-blue-100 text-blue-800',
  LINKEDIN: 'bg-blue-100 text-blue-800',
  FACEBOOK: 'bg-blue-100 text-blue-800',
  INSTAGRAM: 'bg-pink-100 text-pink-800',
  WEBHOOK: 'bg-purple-100 text-purple-800',
  CUSTOM: 'bg-gray-100 text-gray-800',
};

export const ScheduleTable = ({ schedules }: ScheduleTableProps) => {
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const router = useRouter();
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const handleEdit = (scheduleId: string) => {
    setEditingSchedule(scheduleId);
  };

  const handleCancel = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post?'))
      return;

    try {
      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to cancel schedule:', error);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this schedule? This action cannot be undone.'
      )
    )
      return;

    try {
      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Content Schedule</h1>
          <p className="text-muted-foreground">
            Manage when your content gets published across different platforms
          </p>
        </div>
        <CreateScheduleDialog>
          <Button data-create-schedule-trigger>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Content
          </Button>
        </CreateScheduleDialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Publish Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <EmptyState
                variant="table"
                colSpan={6}
                icon={Calendar}
                title="No scheduled content"
                description="Schedule your first content piece to get started"
                action={{
                  label: 'Schedule Content',
                  icon: Plus,
                  onClick: () => {
                    const createButton = document.querySelector(
                      '[data-create-schedule-trigger]'
                    ) as HTMLButtonElement;
                    createButton?.click();
                  },
                }}
              />
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">
                          {schedule.content.title}
                        </div>
                        <Badge
                          className={typeColors[schedule.content.type]}
                          variant="outline"
                        >
                          {schedule.content.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">
                          {schedule.destination.name}
                        </div>
                        <Badge
                          className={
                            destinationColors[schedule.destination.type]
                          }
                          variant="outline"
                        >
                          {schedule.destination.type}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isUpcoming(schedule.publishAt) ? (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <div className="font-medium">
                          {formatDateTime(schedule.publishAt)}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {isUpcoming(schedule.publishAt) ? 'Upcoming' : 'Past'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMapping[schedule.status]}>
                      {schedule.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{schedule.campaign.name}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(schedule.id)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(schedule.id)}
                        >
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancel(schedule.id)}
                        >
                          Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(schedule.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingSchedule && (
        <EditScheduleDialog
          scheduleId={editingSchedule}
          schedule={schedules.find((s) => s.id === editingSchedule)}
          onClose={() => setEditingSchedule(null)}
        />
      )}
    </div>
  );
};
