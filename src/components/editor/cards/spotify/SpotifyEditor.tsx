// components/editor/cards/spotify/SpotifyEditor.tsx

import React, { useState } from 'react';
import { CardData } from '../types';
import { Button } from '@/components/ui/button';
import { X, Link, Eye, EyeOff } from 'lucide-react';

interface SpotifyEditorProps {
  data: CardData;
  onEdit: (data: CardData) => void;
  onRemove: () => void;
}

export function SpotifyEditor({ data, onEdit: _onEdit, onRemove }: SpotifyEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const { type, id } = data.metadata as { type: string; id: string };
  
  return (
    <div className="relative border rounded-md p-4 hover:border-green-500 group">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Spotify {type}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            title={showPreview ? 'Show URL' : 'Show Preview'}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            title="Remove"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Card Content */}
      {showPreview ? (
        <div className="relative h-[152px] bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
          <iframe
            className="w-full h-full"
            src={`https://open.spotify.com/embed/${type}/${id}`}
            allow="encrypted-media"
          />
        </div>
      ) : (
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
          <Link className="h-4 w-4" />
          <span>{data.url}</span>
        </div>
      )}
    </div>
  );
}
