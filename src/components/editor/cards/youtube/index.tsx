// components/editor/cards/youtube/index.tsx

import { Video } from 'lucide-react';
import { CardDefinition, CardData } from '../types';
import { YouTubeEditor } from './YouTubeEditor';
import { YouTubePreview } from './YouTubePreview';

interface YouTubeMetadata {
  videoId: string;
  title?: string;
  thumbnail?: string;
}

const youtubePatterns = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
  /youtube\.com\/embed\/([^&\s]+)/
];

export const YouTubeCard: CardDefinition = {
  type: 'youtube',
  name: 'YouTube Video',
  icon: Video,
  patterns: youtubePatterns,

  async extractMetadata(url: string): Promise<YouTubeMetadata> {
    // Extract video ID from URL
    const videoId = youtubePatterns
      .map(pattern => pattern.exec(url)?.[1])
      .find(id => id);

    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // In a real implementation, we might fetch video metadata from YouTube API
    return {
      videoId,
      title: undefined, // We could fetch this from YouTube API
      thumbnail: undefined
    };
  },

  toMarkdown(data: CardData): string {
    return `{% youtube ${data.metadata.videoId} %}`;
  },

  fromMarkdown(markdown: string): CardData | null {
    const match = /{% youtube\s+(\S+)\s*%}/.exec(markdown);
    if (!match) return null;

    return {
      type: 'youtube',
      url: `https://youtube.com/watch?v=${match[1]}`,
      metadata: {
        videoId: match[1]
      }
    };
  },

  EditorComponent: YouTubeEditor,
  PreviewComponent: YouTubePreview
};