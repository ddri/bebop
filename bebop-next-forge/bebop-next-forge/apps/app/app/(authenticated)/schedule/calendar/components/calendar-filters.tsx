'use client';

import type {
  CampaignStatus,
  DestinationType,
  ScheduleStatus,
} from '@repo/database/types';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { Checkbox } from '@repo/design-system/components/ui/checkbox';
import { Label } from '@repo/design-system/components/ui/label';
import {
  CheckCircle,
  Clock,
  Facebook,
  FileCode,
  Globe,
  Hash,
  Instagram,
  Linkedin,
  Mail,
  Megaphone,
  MessageCircle,
  Settings,
  Target,
  Twitter,
  X,
  XCircle,
} from 'lucide-react';

interface CalendarFiltersProps {
  destinations: {
    id: string;
    name: string;
    type: DestinationType;
  }[];
  campaigns: {
    id: string;
    name: string;
    status: CampaignStatus;
  }[];
  selectedPlatforms: DestinationType[];
  setSelectedPlatforms: (platforms: DestinationType[]) => void;
  selectedStatuses: ScheduleStatus[];
  setSelectedStatuses: (statuses: ScheduleStatus[]) => void;
  selectedCampaigns: string[];
  setSelectedCampaigns: (campaigns: string[]) => void;
}

// Platform icon mapping
const PLATFORM_ICONS = {
  HASHNODE: Hash,
  DEVTO: FileCode,
  BLUESKY: MessageCircle,
  MASTODON: Megaphone,
  TWITTER: Twitter,
  LINKEDIN: Linkedin,
  FACEBOOK: Facebook,
  INSTAGRAM: Instagram,
  WORDPRESS: Globe,
  GHOST: Globe,
  CUSTOM: Settings,
  SENDGRID: Mail,
} as const;

// Status icon mapping
const STATUS_ICONS = {
  PENDING: Clock,
  PUBLISHING: Clock,
  PUBLISHED: CheckCircle,
  FAILED: XCircle,
  CANCELLED: XCircle,
} as const;

// Platform display names
const PLATFORM_NAMES = {
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
} as const;

// Status display names
const STATUS_NAMES = {
  PENDING: 'Pending',
  PUBLISHING: 'Publishing',
  PUBLISHED: 'Published',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
} as const;

export const CalendarFilters = ({
  destinations,
  campaigns,
  selectedPlatforms,
  setSelectedPlatforms,
  selectedStatuses,
  setSelectedStatuses,
  selectedCampaigns,
  setSelectedCampaigns,
}: CalendarFiltersProps) => {
  // Get unique platforms from destinations
  const uniquePlatforms = Array.from(
    new Set(destinations.map((dest) => dest.type))
  );

  const handlePlatformToggle = (platform: DestinationType) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handleStatusToggle = (status: ScheduleStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleCampaignToggle = (campaignId: string) => {
    if (selectedCampaigns.includes(campaignId)) {
      setSelectedCampaigns(selectedCampaigns.filter((c) => c !== campaignId));
    } else {
      setSelectedCampaigns([...selectedCampaigns, campaignId]);
    }
  };

  const clearAllFilters = () => {
    setSelectedPlatforms([]);
    setSelectedStatuses([]);
    setSelectedCampaigns([]);
  };

  const hasActiveFilters =
    selectedPlatforms.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedCampaigns.length > 0;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Platform Filters */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Platforms</Label>
          <div className="space-y-2">
            {uniquePlatforms.map((platform) => {
              const PlatformIcon =
                PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] ||
                Settings;
              const platformName =
                PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES] ||
                platform;
              const isSelected = selectedPlatforms.includes(platform);

              return (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={isSelected}
                    onCheckedChange={() => handlePlatformToggle(platform)}
                  />
                  <Label
                    htmlFor={`platform-${platform}`}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <PlatformIcon className="h-4 w-4" />
                    {platformName}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Filters */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Status</Label>
          <div className="space-y-2">
            {(
              [
                'PENDING',
                'PUBLISHING',
                'PUBLISHED',
                'FAILED',
                'CANCELLED',
              ] as ScheduleStatus[]
            ).map((status) => {
              const StatusIcon = STATUS_ICONS[status];
              const statusName = STATUS_NAMES[status];
              const isSelected = selectedStatuses.includes(status);

              return (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={isSelected}
                    onCheckedChange={() => handleStatusToggle(status)}
                  />
                  <Label
                    htmlFor={`status-${status}`}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <StatusIcon className="h-4 w-4" />
                    {statusName}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaign Filters */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Campaigns</Label>
          <div className="max-h-32 space-y-2 overflow-y-auto">
            {campaigns.map((campaign) => {
              const isSelected = selectedCampaigns.includes(campaign.id);

              return (
                <div key={campaign.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`campaign-${campaign.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleCampaignToggle(campaign.id)}
                  />
                  <Label
                    htmlFor={`campaign-${campaign.id}`}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Target className="h-4 w-4" />
                    <span className="truncate">{campaign.name}</span>
                  </Label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t pt-3">
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="gap-1">
                {PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES] ||
                  platform}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handlePlatformToggle(platform)}
                />
              </Badge>
            ))}
            {selectedStatuses.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1">
                {STATUS_NAMES[status]}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleStatusToggle(status)}
                />
              </Badge>
            ))}
            {selectedCampaigns.map((campaignId) => {
              const campaign = campaigns.find((c) => c.id === campaignId);
              return campaign ? (
                <Badge key={campaignId} variant="secondary" className="gap-1">
                  {campaign.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleCampaignToggle(campaignId)}
                  />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
