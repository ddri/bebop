// types/social.ts
import { BlueskyIcon } from '@/components/social/icons/BlueskyIcon';
import { MastodonIcon } from '@/components/social/icons/MastodonIcon';
import { ThreadsIcon } from '@/components/social/icons/ThreadsIcon';

export type PlatformId = 'bluesky' | 'mastodon' | 'threads';

export type PlatformIcon = typeof BlueskyIcon | typeof MastodonIcon | typeof ThreadsIcon;


export interface SocialPlatform {
  id: PlatformId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  requiresAuth: boolean;
  credentialFields: string[];
  helpText?: string;
  placeholders?: Record<string, string>;
  webIntent: boolean;
  intentUrl?: string;
}

export interface SocialCredentials {
  identifier?: string;
  password?: string;
  token?: string;
  instanceUrl?: string;
  [key: string]: string | undefined;
}

export interface SocialShareResponse {
  success: boolean;
  url?: string;
  error?: string;
  platformPostId?: string;
}

export interface SocialShareContent {
  title?: string;
  text: string;
  url?: string;
  description?: string;
}

export interface SocialShareMetrics {
  id?: string;
  platformId: PlatformId;
  collectionId: string;
  shareCount: number;
  successCount: number;
  failureCount: number;
  lastShared?: Date;
  engagementCount?: number;
  createdAt?: Date;
}

export interface SocialSettings {
  credentials: Partial<Record<PlatformId, SocialCredentials>>;
  preferences: Partial<Record<PlatformId, {
    autoShare?: boolean;
    instanceUrl?: string;
  }>>;
}

export interface SocialSettingsStore {
  credentials: Partial<Record<PlatformId, SocialCredentials>>;
  preferences: Partial<Record<PlatformId, {
    autoShare?: boolean;
    instanceUrl?: string;
  }>>;
  setCredentials: (platform: PlatformId, credentials: SocialCredentials) => void;
  clearCredentials: (platform: PlatformId) => void;
  updatePreferences: (platform: PlatformId, preferences: Record<string, any>) => void;
}