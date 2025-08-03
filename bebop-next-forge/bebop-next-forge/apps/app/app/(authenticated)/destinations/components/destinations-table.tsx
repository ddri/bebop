'use client';

import type { Destination, DestinationType } from '@repo/database/types';
import {
  destructiveAction,
  getPlatformColor,
  iconColors,
} from '@repo/design-system';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design-system/components/ui/dropdown-menu';
import { EmptyState } from '@repo/design-system/components/ui/empty-state';
import {
  Globe,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CreateDestinationDialog } from './create-destination-dialog';

interface DestinationsTableProps {
  destinations: Destination[];
}

const typeIcons: Record<DestinationType, React.ReactNode> = {
  // Phase 1 Platforms
  HASHNODE: <Globe className="h-4 w-4" />,
  DEVTO: <Globe className="h-4 w-4" />,
  BLUESKY: <MessageSquare className="h-4 w-4" />,
  MASTODON: <MessageSquare className="h-4 w-4" />,
  // Future Platforms
  WORDPRESS: <Globe className="h-4 w-4" />,
  GHOST: <Globe className="h-4 w-4" />,
  MAILCHIMP: <Mail className="h-4 w-4" />,
  SENDGRID: <Mail className="h-4 w-4" />,
  TWITTER: <MessageSquare className="h-4 w-4" />,
  LINKEDIN: <MessageSquare className="h-4 w-4" />,
  FACEBOOK: <MessageSquare className="h-4 w-4" />,
  INSTAGRAM: <MessageSquare className="h-4 w-4" />,
  WEBHOOK: <Settings className="h-4 w-4" />,
  CUSTOM: <Settings className="h-4 w-4" />,
};

const typeDescriptions: Record<DestinationType, string> = {
  // Phase 1 Platforms
  HASHNODE: 'Technical blogging platform',
  DEVTO: 'Developer community platform',
  BLUESKY: 'Decentralized social network',
  MASTODON: 'Federated social network',
  // Future Platforms
  WORDPRESS: 'WordPress blog or website',
  GHOST: 'Ghost publishing platform',
  MAILCHIMP: 'Email marketing platform',
  SENDGRID: 'Email delivery service',
  TWITTER: 'Twitter social media',
  LINKEDIN: 'LinkedIn professional network',
  FACEBOOK: 'Facebook social media',
  INSTAGRAM: 'Instagram photo sharing',
  WEBHOOK: 'Custom webhook integration',
  CUSTOM: 'Custom destination',
};

export const DestinationsTable = ({ destinations }: DestinationsTableProps) => {
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const router = useRouter();

  const handleEdit = (destination: Destination) => {
    setEditingDestination(destination);
  };

  const handleDelete = async (destinationId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this destination? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/destinations/${destinationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete destination');
      }
    } catch (_error) {
      alert('Failed to delete destination');
    }
  };

  const handleToggleActive = async (destination: Destination) => {
    try {
      const response = await fetch(`/api/destinations/${destination.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !destination.isActive,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to update destination');
      }
    } catch (_error) {
      alert('Failed to update destination');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Publishing Destinations</h1>
          <p className="text-muted-foreground">
            Configure where your content gets published
          </p>
        </div>
        <CreateDestinationDialog>
          <Button data-create-destination-trigger>
            <Plus className="mr-2 h-4 w-4" />
            Add Destination
          </Button>
        </CreateDestinationDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2">
                  {typeIcons[destination.type]}
                  <div>
                    <h3 className="font-semibold">{destination.name}</h3>
                    <p className="text-muted-foreground text-sm">
                      {typeDescriptions[destination.type]}
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(destination)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>Test Connection</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleActive(destination)}
                  >
                    {destination.isActive ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={destructiveAction.text}
                    onClick={() => handleDelete(destination.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getPlatformColor(destination.type)}>
                  {destination.type}
                </Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  {destination.isActive ? (
                    <>
                      <Wifi className={`h-3 w-3 ${iconColors.success}`} />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className={`h-3 w-3 ${iconColors.error}`} />
                      <span>Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-muted-foreground text-sm">
                {new Date(destination.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {destinations.length === 0 && (
        <EmptyState
          variant="inline"
          size="lg"
          icon={Settings}
          title="No destinations configured"
          description="Add your first publishing destination to start scheduling content"
          action={{
            label: 'Add Your First Destination',
            icon: Plus,
            onClick: () => {
              const createButton = document.querySelector(
                '[data-create-destination-trigger]'
              ) as HTMLButtonElement;
              createButton?.click();
            },
          }}
        />
      )}

      {/* Edit Destination Dialog */}
      {editingDestination && (
        <CreateDestinationDialog
          editingDestination={editingDestination}
          onClose={() => setEditingDestination(null)}
        >
          <div />{' '}
          {/* This won't be rendered since the dialog is controlled by editingDestination */}
        </CreateDestinationDialog>
      )}
    </div>
  );
};
