import React, { useState } from 'react';
import { CardData } from '../types';
import { Button } from '@/components/ui/button';
import { Settings2, X, Link, Eye, EyeOff } from 'lucide-react';

interface YouTubeEditorProps {
  data: CardData;
  onEdit: (data: CardData) => void;
  onRemove: () => void;
}

export function YouTubeEditor({ data, onEdit, onRemove }: YouTubeEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  
  return (
    <div className="relative border rounded-md p-4 hover:border-blue-500 group">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium">YouTube</span>
          {data.metadata.title && (
            <span className="text-sm text-slate-500">
              {data.metadata.title}
            </span>
          )}
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
            title="Settings"
          >
            <Settings2 className="h-4 w-4" />
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
        <div className="relative pt-[56.25%] bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${data.metadata.videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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