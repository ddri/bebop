export interface ContentSlot {
  id: string;
  name: string;
  description?: string;
  type: 'article' | 'social' | 'newsletter' | 'announcement';
  platforms: string[];
  suggestedSchedule?: {
    daysFromStart: number; // Days from campaign start
    timeOfDay?: string; // e.g., "09:00"
  };
  contentGuidelines?: string;
  estimatedDuration?: number; // Hours to create
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  platform?: string;
  daysFromStart: number;
  instructions?: string;
  estimatedDuration?: number; // Hours to complete
}

export interface CampaignTemplateStructure {
  contentSlots: ContentSlot[];
  tasks: TaskTemplate[];
  suggestedDuration: number; // Total days for campaign
  platforms: string[];
  goals?: string[];
  targetAudience?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isPublic: boolean;
  userId?: string;
  structure: CampaignTemplateStructure;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateFromCampaignInput {
  campaignId: string;
  name: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

export interface CreateCampaignFromTemplateInput {
  templateId: string;
  name: string;
  description?: string;
  startDate?: string;
  adjustSchedule?: boolean; // Whether to adjust dates based on start date
}

// Pre-built template categories
export const TEMPLATE_CATEGORIES = [
  { id: 'product_launch', name: 'Product Launch', icon: '🚀' },
  { id: 'content_series', name: 'Content Series', icon: '📚' },
  { id: 'event_promotion', name: 'Event Promotion', icon: '📅' },
  { id: 'feature_announcement', name: 'Feature Announcement', icon: '✨' },
  { id: 'tutorial_series', name: 'Tutorial Series', icon: '🎓' },
  { id: 'community_engagement', name: 'Community Engagement', icon: '👥' },
  { id: 'custom', name: 'Custom', icon: '⚙️' }
] as const;

export type TemplateCategoryId = typeof TEMPLATE_CATEGORIES[number]['id'];