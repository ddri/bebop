// components/editor/RichMediaTransformer.tsx
import React from 'react';

interface EmbedConfig {
  type: string;
  component: React.ComponentType<Record<string, unknown>>;
  pattern: RegExp;
  getEmbedData: (url: string) => Record<string, string>;
}

const embedConfigs: EmbedConfig[] = [
  {
    type: 'youtube',
    pattern: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    getEmbedData: (url: string) => ({
      videoId: url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1] || ''
    }),
    component: ({ videoId }: { videoId: string }) => (
      <div className="relative w-full pt-[56.25%] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden my-4">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  },
  {
    type: 'twitter',
    pattern: /twitter\.com\/\w+\/status\/(\d+)/,
    getEmbedData: (url: string) => ({
      tweetId: url.match(/twitter\.com\/\w+\/status\/(\d+)/)?.[1] || ''
    }),
    component: ({ tweetId }: { tweetId: string }) => (
      <div className="border dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 my-4">
        <blockquote className="twitter-tweet" data-conversation="none">
          <a href={`https://twitter.com/i/status/${tweetId}`}>Loading tweet...</a>
        </blockquote>
      </div>
    )
  },
  {
    type: 'spotify',
    pattern: /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/,
    getEmbedData: (url: string) => {
      const match = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
      return {
        type: match?.[1] || '',
        id: match?.[2] || ''
      };
    },
    component: ({ type, id }: { type: string; id: string }) => (
      <div className="relative w-full pt-[152px] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden my-4">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://open.spotify.com/embed/${type}/${id}`}
          allow="encrypted-media"
          loading="lazy"
        />
      </div>
    )
  }
];

export function detectRichMedia(url: string) {
  for (const config of embedConfigs) {
    if (config.pattern.test(url)) {
      const embedData = config.getEmbedData(url);
      return {
        type: config.type,
        component: config.component,
        data: embedData
      };
    }
  }
  return null;
}

export function RichMediaTransformer({ url }: { url: string }) {
  const richMedia = detectRichMedia(url);
  
  if (!richMedia) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        {url}
      </a>
    );
  }

  const EmbedComponent = richMedia.component;
  return <EmbedComponent {...richMedia.data} />;
}

// URL detection and transformation for editor
export function transformUrlToEmbed(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  return text.replace(urlRegex, (url) => {
    const richMedia = detectRichMedia(url);
    if (richMedia) {
      return `::${richMedia.type}[${JSON.stringify(richMedia.data)}]`;
    }
    return url;
  });
}

// Markdown renderer extension
export function processRichMediaMarkdown(markdown: string): string {
  return markdown.replace(
    /::(\w+)\[(.*?)\]/g,
    (match, type, dataStr) => {
      try {
        const data = JSON.parse(dataStr);
        const config = embedConfigs.find(c => c.type === type);
        if (!config) return match;
        
        // Generate HTML for the embed
        switch (type) {
          case 'youtube':
            return `<div class="embed youtube">
              <iframe src="https://www.youtube.com/embed/${data.videoId}" 
                class="w-full aspect-video rounded-lg" 
                frameborder="0" 
                allowfullscreen>
              </iframe>
            </div>`;
          case 'twitter':
            return `<div class="twitter-embed" data-tweet-id="${data.tweetId}"></div>`;
          case 'spotify':
            return `<div class="spotify-embed">
              <iframe src="https://open.spotify.com/embed/${data.type}/${data.id}"
                class="w-full h-[152px] rounded-lg"
                frameborder="0" 
                allowtransparency="true" 
                allow="encrypted-media">
              </iframe>
            </div>`;
          default:
            return match;
        }
      } catch (e) {
        return match;
      }
    }
  );
}