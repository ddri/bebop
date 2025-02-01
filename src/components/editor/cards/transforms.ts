// components/editor/cards/transforms.ts

import { cardRegistry } from './registry';
import { CardData } from './types';

export function processRichMediaMarkdown(markdown: string): string {
  return markdown.replace(/{%\s*(\w+)\s+([^%]+)%}/g, (match, type, data) => {
    try {
      switch (type) {
        case 'youtube':
          const videoId = data.trim();
          return `
            <div class="relative w-full pt-[56.25%] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden my-4">
              <iframe 
                class="absolute inset-0 w-full h-full" 
                src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          `.trim();

        case 'spotify':
          const [embedType, spotifyId] = data.trim().split(' ');
          return `
            <div class="relative w-full pt-[152px] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden my-4">
              <iframe
                class="absolute inset-0 w-full h-full"
                src="https://open.spotify.com/embed/${embedType}/${spotifyId}"
                frameborder="0"
                allowtransparency="true"
                allow="encrypted-media"
              ></iframe>
            </div>
          `.trim();

        default:
          return match;
      }
    } catch (error) {
      console.error('Error processing card markdown:', error);
      return match;
    }
  });
}