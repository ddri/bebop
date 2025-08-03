'use client';

import type {
  Campaign,
  Content,
  ContentStatus,
  ContentType,
} from '@repo/database/types';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { StatusBadge } from '@repo/design-system/components/ui/status-badge';
import { Calendar, FileText, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { CreateContentDialog } from '../../../content/components/create-content-dialog';

interface CampaignContentProps {
  campaign: Campaign & {
    content: Content[];
  };
}

const statusMapping: Record<
  ContentStatus,
  'draft' | 'ready' | 'published' | 'archived'
> = {
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

export const CampaignContent = ({ campaign }: CampaignContentProps) => {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Campaign Content</h2>
          <p className="text-muted-foreground text-sm">
            Create and manage content for {campaign.name}
          </p>
        </div>
        <CreateContentDialog defaultCampaignId={campaign.id}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </CreateContentDialog>
      </div>

      {/* Content Grid */}
      {campaign.content.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaign.content.map((content) => (
            <Card
              key={content.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-base">
                      {content.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge status={statusMapping[content.status]}>
                        {content.status}
                      </StatusBadge>
                      <span className="text-muted-foreground text-xs">
                        {typeLabels[content.type]}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {content.excerpt && (
                    <p className="line-clamp-3 text-muted-foreground text-sm">
                      {content.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>
                      Created {new Date(content.createdAt).toLocaleDateString()}
                    </span>
                    {content.updatedAt !== content.createdAt && (
                      <span>
                        Updated{' '}
                        {new Date(content.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">No content yet</h3>
            <p className="mb-4 max-w-md text-center text-muted-foreground text-sm">
              Start creating content for your {campaign.name} campaign. You can
              create blog posts, social media content, emails, and more.
            </p>
            <CreateContentDialog defaultCampaignId={campaign.id}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Content
              </Button>
            </CreateContentDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
