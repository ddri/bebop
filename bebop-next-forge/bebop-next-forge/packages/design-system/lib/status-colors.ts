/**
 * Semantic color utilities for status indicators and platform badges
 * Uses design system CSS variables for consistent theming
 */

export const statusColors = {
  // Status variants
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20", 
  error: "bg-destructive/10 text-destructive border-destructive/20",
  info: "bg-info/10 text-info border-info/20",
  
  // Content/Schedule status colors
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success",
  ready: "bg-info/10 text-info", 
  published: "bg-success/10 text-success",
  completed: "bg-info/10 text-info",
  archived: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
  
  // Platform colors - using info for consistency 
  platform: "bg-info/10 text-info",
  custom: "bg-muted text-muted-foreground",
} as const;

export const iconColors = {
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive", 
  info: "text-info",
  muted: "text-muted-foreground",
} as const;

export const backgroundColors = {
  success: "bg-success/5",
  warning: "bg-warning/5",
  error: "bg-destructive/5",
  info: "bg-info/5",
  muted: "bg-muted",
} as const;

export const borderColors = {
  success: "border-success/20",
  warning: "border-warning/20", 
  error: "border-destructive/20",
  info: "border-info/20",
  muted: "border-border",
} as const;

/**
 * Platform-specific color mappings
 */
export const platformColors = {
  HASHNODE: statusColors.platform,
  DEVTO: statusColors.platform, 
  BLUESKY: statusColors.platform,
  MASTODON: statusColors.platform,
  WORDPRESS: statusColors.platform,
  GHOST: statusColors.custom,
  MAILCHIMP: statusColors.platform,
  SENDGRID: statusColors.platform,
  TWITTER: statusColors.platform,
  LINKEDIN: statusColors.platform,
  FACEBOOK: statusColors.platform,
  INSTAGRAM: statusColors.platform,
  WEBHOOK: statusColors.custom,
  CUSTOM: statusColors.custom,
} as const;

/**
 * Content/Schedule status mappings
 */
export const contentStatusColors = {
  DRAFT: statusColors.draft,
  ACTIVE: statusColors.active,
  READY: statusColors.ready,
  PUBLISHED: statusColors.published,
  COMPLETED: statusColors.completed,
  ARCHIVED: statusColors.archived,
  FAILED: statusColors.failed,
  PENDING: statusColors.info,
  PUBLISHING: statusColors.info,
} as const;

/**
 * Get color classes for a platform type
 */
export function getPlatformColor(platform: keyof typeof platformColors): string {
  return platformColors[platform] || statusColors.custom;
}

/**
 * Get color classes for a content/schedule status
 */
export function getStatusColor(status: keyof typeof contentStatusColors): string {
  return contentStatusColors[status] || statusColors.draft;
}

/**
 * Utility for destructive actions (delete, cancel, etc.)
 */
export const destructiveAction = {
  text: "text-destructive hover:text-destructive/80",
  background: "hover:bg-destructive/5",
  button: "text-destructive hover:text-destructive/80 hover:bg-destructive/5",
} as const;