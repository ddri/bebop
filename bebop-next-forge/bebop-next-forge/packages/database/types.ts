// Client-safe types export
export type {
  Campaign,
  Content,
  Schedule,
  Destination,
  Analytics,
  Media,
  PublishedContent,
} from './generated/client';

// Import the namespace to use in type definitions
import { $Enums } from './generated/client';

// Export enums from the $Enums namespace
export { $Enums } from './generated/client';

// Re-export enum types for easier importing
export type CampaignStatus = $Enums.CampaignStatus;
export type ContentType = $Enums.ContentType;
export type ContentStatus = $Enums.ContentStatus;
export type ScheduleStatus = $Enums.ScheduleStatus;
export type DestinationType = $Enums.DestinationType;

// Re-export enum values for easier importing
export const CampaignStatus = $Enums.CampaignStatus;
export const ContentType = $Enums.ContentType;
export const ContentStatus = $Enums.ContentStatus;
export const ScheduleStatus = $Enums.ScheduleStatus;
export const DestinationType = $Enums.DestinationType;