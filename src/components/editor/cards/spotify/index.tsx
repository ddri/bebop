// components/editor/cards/spotify/index.tsx

import { Music } from 'lucide-react';
import { CardDefinition, CardData } from '../types';
import { SpotifyEditor } from './SpotifyEditor';
import { SpotifyPreview } from './SpotifyPreview';

interface SpotifyMetadata {
  type: 'track' | 'album' | 'playlist';
  id: string;
  title?: string;
}

const spotifyPatterns = [
  /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/,
  /spotify:(?:track|album|playlist):([a-zA-Z0-9]+)/
];

export const SpotifyCard: CardDefinition = {
  type: 'spotify',
  name: 'Spotify',
  icon: Music,
  patterns: spotifyPatterns,

  async extractMetadata(url: string): Promise<SpotifyMetadata> {
    for (const pattern of spotifyPatterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          type: match[1] as 'track' | 'album' | 'playlist',
          id: match[2],
        };
      }
    }
    throw new Error('Invalid Spotify URL');
  },

  toMarkdown(data: CardData): string {
    const { type, id } = data.metadata;
    return `{% spotify ${type} ${id} %}`;
  },

  fromMarkdown(markdown: string): CardData | null {
    const match = /{% spotify\s+(\w+)\s+([a-zA-Z0-9]+)\s*%}/.exec(markdown);
    if (!match) return null;

    const [_, type, id] = match;
    
    return {
      type: 'spotify',
      url: `https://open.spotify.com/${type}/${id}`,
      metadata: {
        type,
        id
      }
    };
  },

  EditorComponent: SpotifyEditor,
  PreviewComponent: SpotifyPreview
};