import { useState, useCallback, useEffect } from 'react';

export interface ContentStaging {
  id: string;
  campaignId: string;
  topicId: string;
  status: 'draft' | 'ready' | 'scheduled';
  platforms: string[];
  scheduledFor?: string;
  campaign: {
    id: string;
    name: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentStagingInput {
  campaignId: string;
  topicId: string;
  status: 'draft' | 'ready' | 'scheduled';
  platforms: string[];
  scheduledFor?: string;
}

export interface UpdateContentStagingInput {
  status?: 'draft' | 'ready' | 'scheduled';
  platforms?: string[];
  scheduledFor?: string | null;
}

export const useContentStaging = (campaignId?: string) => {
  const [stagingItems, setStagingItems] = useState<ContentStaging[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchContentStaging = useCallback(async () => {
    if (!campaignId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/staging?campaignId=${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch content staging');
      const data = await response.json();
      setStagingItems(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchContentStaging();
  }, [fetchContentStaging]);

  const createContentStaging = useCallback(async (input: CreateContentStagingInput) => {
    try {
      const response = await fetch('/api/staging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create content staging');
      }

      const newStaging = await response.json();
      setStagingItems(prev => [...prev, newStaging]);
      return newStaging;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  const updateContentStaging = useCallback(async (id: string, data: UpdateContentStagingInput) => {
    try {
      const response = await fetch(`/api/staging/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update content staging');
      }

      const updatedStaging = await response.json();
      setStagingItems(prev => 
        prev.map(item => 
          item.id === id ? updatedStaging : item
        )
      );
      return updatedStaging;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  const deleteContentStaging = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/staging/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete content staging');
      }

      setStagingItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  // Helper functions for workflow management
  const moveToReady = useCallback(async (id: string) => {
    return updateContentStaging(id, { status: 'ready' });
  }, [updateContentStaging]);

  const moveToScheduled = useCallback(async (id: string, scheduledFor?: string) => {
    return updateContentStaging(id, { 
      status: 'scheduled',
      scheduledFor 
    });
  }, [updateContentStaging]);

  const moveToDraft = useCallback(async (id: string) => {
    return updateContentStaging(id, { 
      status: 'draft',
      scheduledFor: null 
    });
  }, [updateContentStaging]);

  // Get staging items by status
  const draftItems = stagingItems.filter(item => item.status === 'draft');
  const readyItems = stagingItems.filter(item => item.status === 'ready');
  const scheduledItems = stagingItems.filter(item => item.status === 'scheduled');

  return {
    stagingItems,
    draftItems,
    readyItems,
    scheduledItems,
    loading,
    error,
    createContentStaging,
    updateContentStaging,
    deleteContentStaging,
    moveToReady,
    moveToScheduled,
    moveToDraft,
    refetch: fetchContentStaging,
  };
};

export default useContentStaging;