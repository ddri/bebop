// components/editor/cards/types.ts

import { LucideIcon } from 'lucide-react';

export interface CardData {
  type: string;
  url: string;
  metadata: Record<string, any>;
}

export interface CardDefinition {
  // Unique identifier for this card type
  type: string;
  
  // Human-readable name
  name: string;
  
  // Card icon (Lucide icon component)
  icon: LucideIcon;
  
  // URL patterns this card can handle
  patterns: RegExp[];
  
  // Extract metadata from URL
  extractMetadata: (url: string) => Promise<Record<string, any>>;
  
  // Convert card data to markdown
  toMarkdown: (data: CardData) => string;
  
  // Parse markdown back to card data
  fromMarkdown: (markdown: string) => CardData | null;
  
  // Component to render in editor
  EditorComponent: React.ComponentType<{
    data: CardData;
    onEdit: (data: CardData) => void;
    onRemove: () => void;
  }>;
  
  // Component to render in preview/published content
  PreviewComponent: React.ComponentType<{
    data: CardData;
  }>;
}

export interface CardRegistry {
  // Register a new card type
  register: (card: CardDefinition) => void;
  
  // Get card definition for a URL
  getCardForUrl: (url: string) => CardDefinition | null;
  
  // Get card definition by type
  getCardByType: (type: string) => CardDefinition | null;
  
  // Get all registered card types
  getAllCards: () => CardDefinition[];
  
  // Parse markdown to find cards
  parseMarkdown: (markdown: string) => CardData[];
}