// components/editor/cards/registry.ts

import { CardDefinition, CardData, CardRegistry } from './types';

class CardRegistryImpl implements CardRegistry {
  private cards: Map<string, CardDefinition> = new Map();

  register(card: CardDefinition) {
    if (this.cards.has(card.type)) {
      throw new Error(`Card type ${card.type} is already registered`);
    }
    this.cards.set(card.type, card);
  }

  getCardForUrl(url: string): CardDefinition | null {
    for (const card of this.cards.values()) {
      if (card.patterns.some(pattern => pattern.test(url))) {
        return card;
      }
    }
    return null;
  }

  getCardByType(type: string): CardDefinition | null {
    return this.cards.get(type) || null;
  }

  getAllCards(): CardDefinition[] {
    return Array.from(this.cards.values());
  }

  parseMarkdown(markdown: string): CardData[] {
    const cards: CardData[] = [];
    
    // Look for card syntax: {% cardtype data %}
    const cardRegex = /{%\s*(\w+)(.*?)%}/g;
    let match;
    
    while ((match = cardRegex.exec(markdown)) !== null) {
      const [_match, type, _data] = match;
      const card = this.getCardByType(type);
      
      if (card) {
        const cardData = card.fromMarkdown(match[0]);
        if (cardData) {
          cards.push(cardData);
        }
      }
    }
    
    return cards;
  }
}

// Create and export a singleton instance
export const cardRegistry = new CardRegistryImpl();

// Export type for convenience
export type { CardDefinition, CardData, CardRegistry };