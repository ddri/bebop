'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ScheduleStatus } from '@repo/database/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createScheduleSchema = z.object({
  contentId: z.string().min(1, 'Content is required'),
  destinationId: z.string().min(1, 'Destination is required'),
  publishAt: z.string().min(1, 'Publish date is required'),
  status: z.nativeEnum(ScheduleStatus),
});

type CreateScheduleForm = z.infer<typeof createScheduleSchema>;

interface CreateScheduleDialogProps {
  children: React.ReactNode;
  campaignId?: string;
}

interface Content {
  id: string;
  title: string;
  type: string;
  campaign: {
    name: string;
  };
}

interface Destination {
  id: string;
  name: string;
  type: string;
}

export const CreateScheduleDialog = ({
  children,
  campaignId,
}: CreateScheduleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<Content[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const router = useRouter();

  const form = useForm<CreateScheduleForm>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: {
      contentId: '',
      destinationId: '',
      publishAt: '',
      status: ScheduleStatus.PENDING,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, destinationsRes] = await Promise.all([
          fetch('/api/content'),
          fetch('/api/destinations'),
        ]);

        if (contentRes.ok) {
          const contentData = await contentRes.json();
          let filteredContent = contentData.filter(
            (c: { status: string }) => c.status === 'READY'
          );

          // Filter by campaign if campaignId is provided
          if (campaignId) {
            filteredContent = filteredContent.filter(
              (c: { campaignId: string }) => c.campaignId === campaignId
            );
          }

          setContent(filteredContent);
        }

        if (destinationsRes.ok) {
          const destinationsData = await destinationsRes.json();
          setDestinations(
            destinationsData.filter((d: { isActive: boolean }) => d.isActive)
          );
        }
      } catch (_error) {}
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const onSubmit = async (data: CreateScheduleForm) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          publishAt: new Date(data.publishAt).toISOString(),
        }),
      });

      if (response.ok) {
        setOpen(false);
        form.reset();
        router.refresh();
      }
    } catch (_error) {}
  };

  // Get minimum datetime (now + 1 hour)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Content</DialogTitle>
          <DialogDescription>
            Choose content and destination, then set when it should be
            published.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content to schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {content.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex flex-col">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-muted-foreground text-sm">
                              {item.type} • {item.campaign.name}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Only content marked as &quot;Ready&quot; can be scheduled.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destinationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={dest.id}>
                          <div className="flex flex-col">
                            <div className="font-medium">{dest.name}</div>
                            <div className="text-muted-foreground text-sm">
                              {dest.type}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose where this content should be published.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Content will be published at this date and time.
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ScheduleStatus.PENDING}>
                        Pending
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    New schedules are set to pending by default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Schedule Content</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
