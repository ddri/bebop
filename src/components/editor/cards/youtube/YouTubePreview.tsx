import React from 'react';
import { CardData } from '../types';

interface YouTubePreviewProps {
  data: CardData;
}

export function YouTubePreview({ data }: YouTubePreviewProps) {
  return (
    <div className="relative pt-[56.25%] bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden my-4">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${data.metadata.videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}