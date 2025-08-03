'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
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
import { Switch } from '@repo/design-system/components/ui/switch';
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const publishingSettingsSchema = z.object({
  defaultPublishTime: z.string(),
  utmCampaign: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  autoHashtags: z.boolean(),
  requireApproval: z.boolean(),
  autoArchive: z.boolean(),
  defaultExcerptLength: z.string(),
  contentTemplate: z.string().optional(),
  socialMediaTemplate: z.string().optional(),
});

type PublishingSettingsForm = z.infer<typeof publishingSettingsSchema>;

export const PublishingSettings = () => {
  const form = useForm<PublishingSettingsForm>({
    resolver: zodResolver(publishingSettingsSchema),
    defaultValues: {
      defaultPublishTime: '09:00',
      utmCampaign: '',
      utmSource: 'bebop',
      utmMedium: 'content',
      autoHashtags: false,
      requireApproval: false,
      autoArchive: true,
      defaultExcerptLength: '160',
      contentTemplate: '',
      socialMediaTemplate: '',
    },
  });

  const onSubmit = async (data: PublishingSettingsForm) => {
    try {
      const response = await fetch('/api/settings/publishing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
      }
    } catch (_error) {}
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default Publishing Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="defaultPublishTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Publishing Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Default time for scheduling content when no specific time
                      is set.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultExcerptLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Excerpt Length</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="160" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum character length for content excerpts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UTM Parameters</CardTitle>
          <p className="text-muted-foreground text-sm">
            Default UTM parameters for tracking content performance
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="utmSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UTM Source</FormLabel>
                    <FormControl>
                      <Input placeholder="bebop" {...field} />
                    </FormControl>
                    <FormDescription>
                      Source of the traffic (e.g., bebop, newsletter)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utmMedium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UTM Medium</FormLabel>
                    <FormControl>
                      <Input placeholder="content" {...field} />
                    </FormControl>
                    <FormDescription>
                      Marketing medium (e.g., content, social, email)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utmCampaign"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UTM Campaign</FormLabel>
                    <FormControl>
                      <Input placeholder="campaign-name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Campaign name (will use actual campaign name if empty)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contentTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blog Post Template</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="# Title&#10;&#10;## Introduction&#10;&#10;Content goes here..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Default template for blog posts and articles
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="socialMediaTemplate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media Template</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="📢 [Your message here]&#10;&#10;🔗 [Link]&#10;&#10;#hashtags"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Default template for social media posts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="requireApproval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Require Approval</FormLabel>
                      <FormDescription>
                        Require manual approval before publishing content
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoHashtags"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Auto-generate Hashtags</FormLabel>
                      <FormDescription>
                        Automatically suggest hashtags based on content
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoArchive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Auto-archive Published Content</FormLabel>
                      <FormDescription>
                        Automatically archive content after 30 days
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Save Publishing Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
