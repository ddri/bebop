'use client';

import type { Content, ContentStatus, ContentType } from '@repo/database/types';
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
import { FileText, MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateContentDialog } from './create-content-dialog';

interface ContentTableProps {
  content: (Content & {
    campaign: {
      id: string;
      name: string;
    };
  })[];
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

export const ContentTable = ({ content }: ContentTableProps) => {
  const router = useRouter();

  const handleRowClick = (contentId: string) => {
    router.push(`/content/${contentId}`);
  };

  const handleDuplicate = async (contentId: string) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate content:', contentId);
  };

  const handleArchive = async (contentId: string) => {
    // TODO: Implement archive functionality  
    console.log('Archive content:', contentId);
  };

  const handleDelete = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      // TODO: Implement delete functionality
      console.log('Delete content:', contentId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Content</h1>
          <p className="text-muted-foreground">
            Manage your content pieces across all campaigns
          </p>
        </div>
        <CreateContentDialog>
          <Button data-create-content-trigger>
            <Plus className="mr-2 h-4 w-4" />
            Create Content
          </Button>
        </CreateContentDialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.length === 0 ? (
              <EmptyState
                variant="table"
                colSpan={6}
                icon={FileText}
                title="No content yet"
                description="Create your first content piece to get started"
                action={{
                  label: 'Create Your First Content',
                  icon: Plus,
                  href: '/content/new',
                }}
              />
            ) : (
              content.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(item.id)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium transition-colors hover:text-primary">
                        {item.title}
                      </div>
                      {item.excerpt && (
                        <div className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                          {item.excerpt}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColors[item.type]}>
                      {typeLabels[item.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMapping[item.status]}>
                      {item.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{item.campaign.name}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/content/${item.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(item.id);
                          }}
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(item.id);
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
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
    </div>
  );
};
