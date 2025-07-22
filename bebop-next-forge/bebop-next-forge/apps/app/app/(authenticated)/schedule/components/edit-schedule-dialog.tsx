'use client';

import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/design-system/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/design-system/components/ui/form';
import { Input } from '@repo/design-system/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design-system/components/ui/select';
import { Schedule, ScheduleStatus, ContentType, DestinationType } from '@repo/database/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const editScheduleSchema = z.object({
  publishAt: z.string().min(1, 'Publish date is required'),
  status: z.nativeEnum(ScheduleStatus),
});

type EditScheduleForm = z.infer<typeof editScheduleSchema>;

interface EditScheduleDialogProps {
  scheduleId: string;
  schedule?: Schedule & {
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
  };
  onClose: () => void;
}

export const EditScheduleDialog = ({ scheduleId, schedule, onClose }: EditScheduleDialogProps) => {
  const router = useRouter();

  const form = useForm<EditScheduleForm>({
    resolver: zodResolver(editScheduleSchema),
    defaultValues: {
      publishAt: '',
      status: ScheduleStatus.PENDING,
    },
  });

  // Set form values when schedule data is available
  useEffect(() => {
    if (schedule) {
      const publishDate = new Date(schedule.publishAt);
      const formattedDate = publishDate.toISOString().slice(0, 16);
      
      form.reset({
        publishAt: formattedDate,
        status: schedule.status,
      });
    }
  }, [schedule, form]);

  const onSubmit = async (data: EditScheduleForm) => {
    try {
      const response = await fetch(`/api/schedule/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publishAt: new Date(data.publishAt).toISOString(),
          status: data.status,
        }),
      });

      if (response.ok) {
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  // Get minimum datetime (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (!schedule) return null;

  return (
    <Dialog open={!!scheduleId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>
            Update the publish date and time or change the status of this scheduled content.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">{schedule.content.title}</p>
          <p className="text-xs text-muted-foreground">
            {schedule.content.type} → {schedule.destination.name}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="publishAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      min={getMinDateTime()}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Update when this content should be published.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ScheduleStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={ScheduleStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Change the status of this scheduled post.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit">Update Schedule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};