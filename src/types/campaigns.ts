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

export interface PublishingSlot {
  id: string;
  topicId: string;
  platform: string;
  scheduledDate: Date;
  status: 'scheduled' | 'published' | 'failed';
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  publishingPlans: PublishingPlan[];
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status: CampaignStatus;
}

export interface NewPublicationSlot {
  topicId?: string;
  platform?: string;
  scheduledDate?: Date;
}

export interface Platform {
  id: string;
  name: string;
}

export const PLATFORMS: Platform[] = [
  { id: 'devto', name: 'Dev.to' },
  { id: 'hashnode', name: 'Hashnode' },
  { id: 'medium', name: 'Medium' }
];