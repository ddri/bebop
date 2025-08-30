// Campaign Export/Import Types

export interface CampaignExportData {
  version: '1.0'; // Export format version for compatibility
  exportedAt: string;
  exportedBy?: string;
  
  campaign: {
    id: string;
    name: string;
    description?: string;
    status: string;
    startDate?: string;
    endDate?: string;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  
  // Content staging items
  contentStaging: Array<{
    id: string;
    topicId: string;
    status: 'draft' | 'ready' | 'scheduled';
    platforms: string[];
    scheduledFor?: string;
    topic?: {
      name: string;
      description?: string;
      content?: string;
      metadata?: Record<string, unknown>;
    };
  }>;
  
  // Manual tasks
  manualTasks: Array<{
    id: string;
    title: string;
    description?: string;
    platform?: string;
    status: 'todo' | 'in_progress' | 'completed';
    dueDate?: string;
    completedAt?: string;
    instructions?: string;
  }>;
  
  // Publishing plans
  publishingPlans: Array<{
    id: string;
    topicId: string;
    platform: string;
    scheduledAt?: string;
    publishedAt?: string;
    status: string;
    platformPostId?: string;
    metrics?: Record<string, unknown>;
  }>;
  
  // Analytics snapshot (optional)
  analytics?: {
    totalViews: number;
    totalEngagement: number;
    totalShares: number;
    platforms: Array<{
      platform: string;
      views: number;
      engagement: number;
    }>;
    exportedAt: string;
  };
  
  // Campaign goals
  goals?: Array<{
    id: string;
    type: string;
    target: number;
    current: number;
    completedAt?: string;
  }>;
}

export interface CampaignImportOptions {
  // What to import
  includeContent: boolean;
  includeTasks: boolean;
  includePublishingPlans: boolean;
  includeAnalytics: boolean;
  includeGoals: boolean;
  
  // How to handle conflicts
  conflictResolution: 'skip' | 'overwrite' | 'duplicate';
  
  // Name handling
  namePrefix?: string;
  nameSuffix?: string;
  
  // Date adjustment
  adjustDates: boolean;
  dateOffset?: number; // Days to offset from original dates
  
  // Status reset
  resetStatus: boolean; // Reset all items to draft/todo
}

export interface CampaignImportResult {
  success: boolean;
  campaignId?: string;
  imported: {
    contentStaging: number;
    manualTasks: number;
    publishingPlans: number;
    goals: number;
  };
  skipped: {
    contentStaging: number;
    manualTasks: number;
    publishingPlans: number;
    goals: number;
  };
  errors: Array<{
    type: 'validation' | 'conflict' | 'database';
    message: string;
    field?: string;
  }>;
  warnings: string[];
}

export interface CampaignExportOptions {
  // What to include
  includeContent: boolean;
  includeContentDetails: boolean; // Include full topic content
  includeTasks: boolean;
  includePublishingPlans: boolean;
  includeAnalytics: boolean;
  includeGoals: boolean;
  
  // Format options
  format: 'json' | 'csv';
  prettify: boolean; // For JSON
  
  // Privacy options
  anonymize: boolean; // Remove user IDs and personal data
  excludeSecrets: boolean; // Remove API keys, tokens, etc.
}

export interface CampaignCSVExport {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    contentCount: number;
    taskCount: number;
    publishedCount: number;
  }>;
  
  content: Array<{
    campaignId: string;
    campaignName: string;
    contentId: string;
    title: string;
    status: string;
    platforms: string;
    scheduledFor: string;
    views: number;
    engagement: number;
  }>;
  
  tasks: Array<{
    campaignId: string;
    campaignName: string;
    taskId: string;
    title: string;
    status: string;
    platform: string;
    dueDate: string;
    completedAt: string;
  }>;
  
  analytics: Array<{
    campaignId: string;
    campaignName: string;
    date: string;
    platform: string;
    views: number;
    engagement: number;
    shares: number;
  }>;
}

// Validation schemas
export const CAMPAIGN_EXPORT_VERSION = '1.0';

export function validateExportData(data: unknown): data is CampaignExportData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  
  return (
    d.version === CAMPAIGN_EXPORT_VERSION &&
    d.exportedAt &&
    d.campaign &&
    typeof d.campaign === 'object' &&
    (d.campaign as Record<string, unknown>).name &&
    Array.isArray(d.contentStaging) &&
    Array.isArray(d.manualTasks)
  );
}