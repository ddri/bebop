'use client';

import type { Campaign, CampaignStatus } from '@repo/database/types';
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
import { Briefcase, MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateCampaignDialog } from './create-campaign-dialog';

interface CampaignsTableProps {
  campaigns: Campaign[];
  statusFilter?: string;
}

const statusMapping: Record<
  CampaignStatus,
  'draft' | 'active' | 'paused' | 'completed' | 'archived'
> = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const CampaignsTable = ({
  campaigns,
  statusFilter,
}: CampaignsTableProps) => {
  const router = useRouter();

  const handleRowClick = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };

  const handleDuplicate = async (campaignId: string) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate campaign:', campaignId);
  };

  const handleArchive = async (campaignId: string) => {
    // TODO: Implement archive functionality  
    console.log('Archive campaign:', campaignId);
  };

  const handleDelete = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      // TODO: Implement delete functionality
      console.log('Delete campaign:', campaignId);
    }
  };
  const getEmptyStateMessage = () => {
    switch (statusFilter) {
      case 'DRAFT':
        return {
          title: 'No draft campaigns',
          description: 'Draft campaigns will appear here when you save them',
        };
      case 'ACTIVE':
        return {
          title: 'No active campaigns',
          description: "Campaigns you've started will appear here",
        };
      case 'COMPLETED':
        return {
          title: 'No completed campaigns',
          description: 'Finished campaigns will appear here',
        };
      case 'PAUSED':
        return {
          title: 'No paused campaigns',
          description: 'Paused campaigns will appear here',
        };
      case 'ARCHIVED':
        return {
          title: 'No archived campaigns',
          description: 'Archived campaigns will appear here',
        };
      default:
        return {
          title: 'No campaigns yet',
          description: 'Create your first campaign to get started',
        };
    }
  };

  const emptyState = getEmptyStateMessage();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your content marketing campaigns
          </p>
        </div>
        <CreateCampaignDialog>
          <Button data-create-campaign-trigger>
            <Plus className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </CreateCampaignDialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <EmptyState
                variant="table"
                colSpan={6}
                icon={Briefcase}
                title={emptyState.title}
                description={emptyState.description}
                action={
                  statusFilter
                    ? undefined
                    : {
                        label: 'Create Your First Campaign',
                        icon: Plus,
                        href: '/campaigns/new',
                      }
                }
              />
            ) : (
              campaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(campaign.id)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium transition-colors hover:text-primary">
                        {campaign.name}
                      </div>
                      {campaign.description && (
                        <div className="mt-1 text-muted-foreground text-sm">
                          {campaign.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={statusMapping[campaign.status]}>
                      {campaign.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {campaign.startDate
                      ? new Date(campaign.startDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {new Date(campaign.createdAt).toLocaleDateString()}
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
                          <Link href={`/campaigns/${campaign.id}`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(campaign.id);
                          }}
                        >
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(campaign.id);
                          }}
                        >
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(campaign.id);
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
