// types/social.ts

export interface SocialPlatform {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    requiresAuth: boolean;
    credentialFields: string[]; 
    
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
    platformId: PlatformId;
    collectionId: string;
    shareCount: number;
    successCount: number;
    failureCount: number;
    lastShared?: Date;
    engagementCount?: number;
  }
  export interface SocialSettings {
    credentials: Record<PlatformId, Record<string, string>>;
    preferences: Record<PlatformId, {
      autoShare?: boolean;
      instanceUrl?: string;
    }>;
  }
  
  export interface SocialCredentials {
    identifier?: string;
    password?: string;
    token?: string;
    instanceUrl?: string;
  }

  export interface SocialSettingsStore {
    credentials: Record<PlatformId, Record<string, string>>;
    setCredentials: (platform: PlatformId, credentials: Record<string, string>) => void;
    clearCredentials: (platform: PlatformId) => void;
  }

  export type PlatformId = 'bluesky' | 'mastodon' | 'threads';