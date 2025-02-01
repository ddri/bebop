// components/editor/cards/index.ts

// First import and export registry singleton
import { cardRegistry } from './registry';
export { cardRegistry };

// Export core types and interfaces
export * from './types';

// Export transform utilities
export { processRichMediaMarkdown } from './transforms';

// Export URL detector
export { urlDetectorExtension } from './urlDetectorExtension';

// Export card components
export { URLDetectorPopup } from './URLDetectorPopup';

// Register all card types
import { YouTubeCard } from './youtube';
import { SpotifyCard } from './spotify';

// Initialize registry with available cards
[YouTubeCard, SpotifyCard].forEach(card => {
  try {
    cardRegistry.register(card);
  } catch (error) {
    console.error(`Failed to register card type ${card.type}:`, error);
  }
});