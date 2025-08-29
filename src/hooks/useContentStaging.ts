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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

  // Bulk operations
  const bulkUpdateStatus = useCallback(async (ids: string[], status: 'draft' | 'ready' | 'scheduled', scheduledFor?: string) => {
    const errors: Error[] = [];
    const successes: ContentStaging[] = [];
    
    for (const id of ids) {
      try {
        const updated = await updateContentStaging(id, { 
          status,
          ...(status === 'scheduled' && scheduledFor ? { scheduledFor } : {}),
          ...(status === 'draft' ? { scheduledFor: null } : {})
        });
        successes.push(updated);
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error(`Failed to update ${id}`));
      }
    }
    
    if (errors.length > 0) {
      setError(new Error(`Failed to update ${errors.length} of ${ids.length} items`));
    }
    
    // Clear selection after bulk operation
    setSelectedIds(new Set());
    
    return { successes, errors };
  }, [updateContentStaging]);

  const bulkDelete = useCallback(async (ids: string[]) => {
    const errors: Error[] = [];
    
    for (const id of ids) {
      try {
        await deleteContentStaging(id);
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error(`Failed to delete ${id}`));
      }
    }
    
    if (errors.length > 0) {
      setError(new Error(`Failed to delete ${errors.length} of ${ids.length} items`));
    }
    
    // Clear selection after bulk operation
    setSelectedIds(new Set());
    
    return errors.length === 0;
  }, [deleteContentStaging]);

  const bulkUpdatePlatforms = useCallback(async (ids: string[], platforms: string[]) => {
    const errors: Error[] = [];
    const successes: ContentStaging[] = [];
    
    for (const id of ids) {
      try {
        const updated = await updateContentStaging(id, { platforms });
        successes.push(updated);
      } catch (err) {
        errors.push(err instanceof Error ? err : new Error(`Failed to update ${id}`));
      }
    }
    
    if (errors.length > 0) {
      setError(new Error(`Failed to update ${errors.length} of ${ids.length} items`));
    }
    
    // Clear selection after bulk operation
    setSelectedIds(new Set());
    
    return { successes, errors };
  }, [updateContentStaging]);

  // Selection management
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(stagingItems.map(item => item.id)));
  }, [stagingItems]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectByStatus = useCallback((status: 'draft' | 'ready' | 'scheduled') => {
    const itemsWithStatus = stagingItems.filter(item => item.status === status);
    setSelectedIds(new Set(itemsWithStatus.map(item => item.id)));
  }, [stagingItems]);

  // Get staging items by status
  const draftItems = stagingItems.filter(item => item.status === 'draft');
  const readyItems = stagingItems.filter(item => item.status === 'ready');
  const scheduledItems = stagingItems.filter(item => item.status === 'scheduled');

  return {
    stagingItems,
    draftItems,
    readyItems,
    scheduledItems,
    selectedIds,
    loading,
    error,
    createContentStaging,
    updateContentStaging,
    deleteContentStaging,
    moveToReady,
    moveToScheduled,
    moveToDraft,
    // Bulk operations
    bulkUpdateStatus,
    bulkDelete,
    bulkUpdatePlatforms,
    // Selection management
    toggleSelection,
    selectAll,
    selectNone,
    selectByStatus,
    refetch: fetchContentStaging,
  };
};

export default useContentStaging;