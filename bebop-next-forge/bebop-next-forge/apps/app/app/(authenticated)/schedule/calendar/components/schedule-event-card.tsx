'use client';

import type { DestinationType, ScheduleStatus } from '@repo/database/types';
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
  Twitter,
  XCircle,
} from 'lucide-react';

interface ScheduleEventCardProps {
  title: string;
  platform: DestinationType;
  status: ScheduleStatus;
  destinationName: string;
  time: Date | null;
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

export const ScheduleEventCard = ({
  title,
  platform,
  status,
  destinationName,
  time,
}: ScheduleEventCardProps) => {
  const PlatformIcon =
    PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] || Settings;
  const StatusIcon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock;
  const platformName =
    PLATFORM_NAMES[platform as keyof typeof PLATFORM_NAMES] || platform;

  const timeString = time
    ? time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  return (
    <div className="flex flex-col gap-1 p-1 text-white text-xs">
      {/* Main content */}
      <div className="flex items-start gap-1">
        <PlatformIcon className="mt-0.5 h-3 w-3 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium" title={title}>
            {title}
          </div>
          {timeString && <div className="text-xs opacity-90">{timeString}</div>}
        </div>
        <StatusIcon className="h-3 w-3 flex-shrink-0 opacity-80" />
      </div>

      {/* Platform and destination info */}
      <div className="flex items-center justify-between text-xs opacity-90">
        <span className="truncate" title={destinationName}>
          {platformName}
        </span>
        {status === 'FAILED' && (
          <span className="rounded bg-red-500 bg-opacity-30 px-1 text-xs">
            Failed
          </span>
        )}
        {status === 'CANCELLED' && (
          <span className="rounded bg-gray-500 bg-opacity-30 px-1 text-xs">
            Cancelled
          </span>
        )}
      </div>
    </div>
  );
};
