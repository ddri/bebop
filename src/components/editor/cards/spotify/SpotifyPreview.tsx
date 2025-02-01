
// components/editor/cards/spotify/SpotifyPreview.tsx

import React from 'react';
import { CardData } from '../types';

interface SpotifyPreviewProps {
  data: CardData;
}

export function SpotifyPreview({ data }: SpotifyPreviewProps) {
  const { type, id } = data.metadata;
  
  return (
    <div className="relative h-[152px] bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden my-4">
      <iframe
        className="w-full h-full"
        src={`https://open.spotify.com/embed/${type}/${id}`}
        allow="encrypted-media"
      />
    </div>
  );
}