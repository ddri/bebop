// types/templates.ts

export type TemplateType = 'official-docs' | 'starter-template' | 'community-template' | 'custom';

export interface TemplateAuthor {
  name: string;
  url?: string;
}

export interface TemplateTopic {
  name: string;
  description: string;
  content: string;
  order?: number;
}

export interface TemplateCollection {
  name: string;
  description: string;
  topics: TemplateTopic[];
}

export interface Template {
  id: string;
  type: TemplateType;
  name: string;
  description: string;
  version: string;
  author: TemplateAuthor;
  collections: TemplateCollection[];
  created: string;
  updated: string;
  tags?: string[];
  requiresVersion?: string;
}

// Response types for the API
export interface TemplateImportResponse {
  success: boolean;
  message: string;
  collections?: {
    id: string;
    name: string;
  }[];
  topics?: {
    id: string;
    name: string;
  }[];
  error?: string;
}

export interface TemplateListResponse {
  templates: Template[];
  total: number;
  page: number;
  pageSize: number;
}