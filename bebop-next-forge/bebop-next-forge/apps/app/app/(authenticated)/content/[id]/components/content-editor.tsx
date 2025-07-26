'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/ui/card';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import { Badge } from '@repo/design-system/components/ui/badge';
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
import { Textarea } from '@repo/design-system/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/design-system/components/ui/tabs';
import type { 
  Content, 
  Campaign, 
  Schedule
} from '@repo/database/types';
import { 
  ContentType, 
  ContentStatus 
} from '@repo/database/types';
import { 
  ArrowLeft, 
  Save, 
  Calendar, 
  FileText, 
  Settings,
  Copy,
  Archive,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BlockNoteEditorWrapper } from './blocknote-editor';

const updateContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  type: z.nativeEnum(ContentType),
  status: z.nativeEnum(ContentStatus),
  campaignId: z.string().min(1, 'Campaign is required'),
});

type UpdateContentForm = z.infer<typeof updateContentSchema>;

interface ContentEditorProps {
  content: Content & {
    campaign: {
      id: string;
      name: string;
    };
    schedules: (Schedule & {
      destination: {
        id: string;
        name: string;
        type: string;
      };
    })[];
  };
  campaigns: Campaign[];
}

const statusMapping: Record<ContentStatus, 'draft' | 'ready' | 'published' | 'archived'> = {
  DRAFT: 'draft',
  READY: 'ready',
  PUBLISHED: 'published',
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

export const ContentEditor = ({ content, campaigns }: ContentEditorProps) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const form = useForm<UpdateContentForm>({
    resolver: zodResolver(updateContentSchema),
    defaultValues: {
      title: content.title,
      body: content.body,
      excerpt: content.excerpt || '',
      type: content.type,
      status: content.status,
      campaignId: content.campaignId,
    },
  });

  const onSubmit = async (data: UpdateContentForm) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/content/${content.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.refresh();
        // Could add toast notification here
      }
    } catch (error) {
      console.error('Failed to update content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/content/${content.id}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        const newContent = await response.json();
        router.push(`/content/${newContent.id}`);
      }
    } catch (error) {
      console.error('Failed to duplicate content:', error);
    }
  };

  const handleArchive = async () => {
    try {
      const response = await fetch(`/api/content/${content.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });

      if (response.ok) {
        router.push('/content');
      }
    } catch (error) {
      console.error('Failed to archive content:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/content/${content.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/content');
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 h-16 px-4 md:px-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/content">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">{content.title}</h1>
              <StatusBadge status={statusMapping[content.status]}>
                {content.status}
              </StatusBadge>
              <Badge variant="outline">
                {typeLabels[content.type]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {content.campaign.name} • Created {new Date(content.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button 
              type="submit" 
              form="content-form" 
              disabled={isSaving}
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit">Edit Content</TabsTrigger>
            <TabsTrigger value="schedule">Schedule ({content.schedules.length})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <Form {...form}>
              <form id="content-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Main Content Editor */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Content title..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="excerpt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Excerpt</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Brief description or summary..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                A short summary displayed in previews and social media.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content Body</FormLabel>
                              <FormControl>
                                <BlockNoteEditorWrapper
                                  initialContent={field.value}
                                  onChange={field.onChange}
                                  placeholder="Start writing your content... Use / for commands"
                                  className="min-h-[400px]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Content Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(typeLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                  <SelectItem value={ContentStatus.DRAFT}>Draft</SelectItem>
                                  <SelectItem value={ContentStatus.READY}>Ready</SelectItem>
                                  <SelectItem value={ContentStatus.PUBLISHED}>Published</SelectItem>
                                  <SelectItem value={ContentStatus.ARCHIVED}>Archived</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="campaignId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select campaign" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {campaigns.map((campaign) => (
                                    <SelectItem key={campaign.id} value={campaign.id}>
                                      {campaign.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    {/* Content Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Content Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Word Count</span>
                          <span>{content.body.split(/\s+/).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Character Count</span>
                          <span>{content.body.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Created</span>
                          <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Modified</span>
                          <span>{new Date(content.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Publishing Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {content.schedules.length > 0 ? (
                  <div className="space-y-4">
                    {content.schedules.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{schedule.destination.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.destination.type} • {new Date(schedule.publishAt).toLocaleString()}
                          </div>
                        </div>
                        <StatusBadge status={statusMapping[schedule.status as ContentStatus] || 'draft'}>
                          {schedule.status}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No schedules yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This content hasn&apos;t been scheduled for publishing.
                    </p>
                    <Button asChild>
                      <Link href="/schedule">
                        Schedule Content
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Content ID</label>
                  <p className="text-sm text-muted-foreground font-mono">{content.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">URL Slug</label>
                  <p className="text-sm text-muted-foreground">
                    {content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};