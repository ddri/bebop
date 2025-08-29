// types/campaigns.ts
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

export interface PublishingPlan {
  id: string;
  campaignId: string;
  topicId: string;
  platform: string;
  status: 'scheduled' | 'published' | 'failed';
  scheduledFor?: Date;
  publishedAt?: Date;
  publishedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  publishingPlans: PublishingPlan[];
  contentStaging: ContentStaging[];
  manualTasks: ManualTask[];
}

export interface ContentStaging {
  id: string;
  campaignId: string;
  topicId: string;
  status: 'draft' | 'ready' | 'scheduled';
  platforms: string[];
  scheduledFor?: string;
  campaign: {
    id: string;
    name: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ManualTask {
  id: string;
  campaignId: string;
  contentStagingId?: string;
  title: string;
  description?: string;
  platform?: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  completedAt?: string;
  instructions?: string;
  notes?: string;
  campaign: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  status: CampaignStatus;
}

export interface NewPublicationSlot {
  topicId?: string;
  platform?: string;
}

export interface Platform {
  id: string;
  name: string;
}

export const PLATFORMS: Platform[] = [
  { id: 'devto', name: 'Dev.to' },
  { id: 'hashnode', name: 'Hashnode' },
  { id: 'beehiiv', name: 'Beehiiv' },
  { id: 'medium', name: 'Medium' }
];