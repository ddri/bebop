'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import { Button } from '@repo/design-system/components/ui/button';
import { Label } from '@repo/design-system/components/ui/label';
import { Input } from '@repo/design-system/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components/ui/select';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { Separator } from '@repo/design-system/components/ui/separator';
import { ScrollArea } from '@repo/design-system/components/ui/scroll-area';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Calendar, Clock, FileText, Hash, Trash2, Edit3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { 
  Schedule, 
  ScheduleStatus, 
  ContentType, 
  DestinationType,
  CampaignStatus
} from '@repo/database/types';

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule & {
    content: {
      id: string;
      title: string;
      body: string;
      excerpt: string | null;
      type: ContentType;
    };
    campaign: {
      id: string;
      name: string;
      status: CampaignStatus;
    };
    destination: {
      id: string;
      name: string;
      type: DestinationType;
    };
  };
  onUpdate?: () => void;
}

const STATUS_OPTIONS: { value: ScheduleStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'PENDING', label: 'Pending', icon: Clock },
  { value: 'PUBLISHED', label: 'Published', icon: CheckCircle },
  { value: 'FAILED', label: 'Failed', icon: XCircle },
  { value: 'CANCELLED', label: 'Cancelled', icon: AlertCircle },
];

const STATUS_COLORS: Record<ScheduleStatus, string> = {
  PENDING: 'default',
  PUBLISHED: 'success',
  FAILED: 'destructive',
  CANCELLED: 'secondary',
  PUBLISHING: 'default',
};

const formatContentType = (type: ContentType): string => {
  const typeMap: Record<string, string> = {
    BLOG_POST: 'Blog Post',
    EMAIL: 'Email',
    SOCIAL_POST: 'Social Post',
    TWITTER: 'Twitter',
    LINKEDIN: 'LinkedIn',
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    CUSTOM: 'Custom',
  };
  return typeMap[type] || type;
};

const formatDestinationType = (type: DestinationType): string => {
  const typeMap: Record<string, string> = {
    HASHNODE: 'Hashnode',
    DEVTO: 'Dev.to',
    BLUESKY: 'Bluesky',
    MASTODON: 'Mastodon',
    TWITTER: 'Twitter',
    LINKEDIN: 'LinkedIn',
    FACEBOOK: 'Facebook',
    INSTAGRAM: 'Instagram',
    WORDPRESS: 'WordPress',
    GHOST: 'Ghost',
    CUSTOM: 'Custom',
    SENDGRID: 'SendGrid',
  };
  return typeMap[type] || type;
};

export const EditScheduleModal = ({ isOpen, onClose, schedule, onUpdate }: EditScheduleModalProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state
  const [publishAt, setPublishAt] = useState(format(new Date(schedule.publishAt), "yyyy-MM-dd'T'HH:mm"));
  const [status, setStatus] = useState<ScheduleStatus>(schedule.status);

  const handleUpdate = async () => {
    const toastId = toast.loading('Updating schedule...');
    
    try {
      const response = await fetch(`/api/schedule/${schedule.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publishAt: new Date(publishAt).toISOString(),
          status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update schedule');
      }

      toast.success('Schedule updated successfully', { id: toastId });
      
      // Refresh data
      startTransition(() => {
        router.refresh();
      });
      
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update schedule', { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this scheduled post?')) {
      return;
    }

    setIsDeleting(true);
    const toastId = toast.loading('Deleting schedule...');
    
    try {
      const response = await fetch(`/api/schedule/${schedule.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete schedule');
      }

      toast.success('Schedule deleted successfully', { id: toastId });
      
      // Refresh data
      startTransition(() => {
        router.refresh();
      });
      
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete schedule', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const StatusIcon = STATUS_OPTIONS.find(opt => opt.value === status)?.icon || Clock;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>
            Update the schedule details for this content
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1">
          <div className="space-y-6 pr-4">
            {/* Content Preview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content Preview
                  </CardTitle>
                  <Badge variant={schedule.content.type === 'BLOG_POST' ? 'default' : 'secondary'}>
                    {formatContentType(schedule.content.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <h3 className="font-semibold">{schedule.content.title}</h3>
                {schedule.content.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {schedule.content.excerpt}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Campaign & Destination Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{schedule.campaign.name}</p>
                  <Badge 
                    variant={schedule.campaign.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {schedule.campaign.status}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Destination</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{schedule.destination.name}</p>
                  <Badge variant="outline" className="mt-1">
                    {formatDestinationType(schedule.destination.type)}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Schedule Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="publishAt">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Publish Date & Time
                </Label>
                <Input
                  id="publishAt"
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  disabled={schedule.status === 'PUBLISHED'}
                />
                {schedule.status === 'PUBLISHED' && (
                  <p className="text-sm text-muted-foreground">
                    Published content cannot be rescheduled
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  <StatusIcon className="inline h-3 w-3 mr-1" />
                  Status
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as ScheduleStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Info */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(schedule.createdAt), 'PPp')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{format(new Date(schedule.updatedAt), 'PPp')}</span>
                </div>
                {schedule.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span>{format(new Date(schedule.publishedAt), 'PPp')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || isPending || schedule.status === 'PUBLISHED'}
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          
          <Button variant="outline" onClick={onClose} disabled={isDeleting || isPending}>
            Cancel
          </Button>
          
          <Button 
            onClick={handleUpdate} 
            disabled={isDeleting || isPending || (publishAt === format(new Date(schedule.publishAt), "yyyy-MM-dd'T'HH:mm") && status === schedule.status)}
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Update Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};