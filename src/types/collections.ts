// types/collections.ts

import { SocialShareMetrics } from './social';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  topicIds: string[];
  publishedUrl?: string;
  hashnodeUrl?: string | null;
  devToUrl?: string | null;
  lastEdited: string;
  createdAt: string;
}

export interface CollectionWithMetrics extends Collection {
  metrics?: SocialShareMetrics[];
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  topicIds: string[];
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  topicIds?: string[];
  publishedUrl?: string;
  hashnodeUrl?: string | null;
  devToUrl?: string | null;
}