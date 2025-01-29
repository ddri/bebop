import { useState, useEffect } from 'react';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  mimeType: string;
}

export function useMedia() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      const response = await fetch('/api/media');
      if (!response.ok) throw new Error('Failed to fetch media items');
      const data = await response.json();
      setMediaItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch media items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  return {
    mediaItems,
    loading,
    error,
    refreshMedia: fetchMedia
  };
}