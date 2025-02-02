import useSWR from 'swr';

interface Collection {
  id: string;
  name: string;
  description?: string;
  topicIds: string[];
  publishedUrl?: string;
  hashnodeUrl?: string | null; 
  devToUrl?: string | null;
  mediumUrl?: string | null;
  lastEdited: string;
  createdAt: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch collections');
  }
  return response.json();
};

export function useCollections() {
  const { data: collections = [], error, mutate } = useSWR<Collection[]>('/api/collections', fetcher);

  const createCollection = async (name: string, description: string | undefined, topicIds: string[]) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, topicIds })
      });
      
      if (!response.ok) throw new Error('Failed to create collection');
      const newCollection = await response.json();
      
      // Optimistic update
      mutate(current => [newCollection, ...(current || [])], false);
      
      // Revalidate
      await mutate();
      return newCollection;
    } catch (err) {
      // Revalidate on error to ensure UI is in sync
      await mutate();
      throw err;
    }
  };

  const updateCollection = async (id: string, data: Partial<Collection>) => {
    try {
      // Optimistic update
      mutate(
        collections?.map(collection =>
          collection.id === id
            ? { ...collection, ...data, lastEdited: new Date().toISOString() }
            : collection
        ),
        false
      );

      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update collection');
      
      // Revalidate
      await mutate();
      return response.json();
    } catch (err) {
      // Revalidate on error
      await mutate();
      throw err;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      // Optimistic update
      mutate(
        collections?.filter(collection => collection.id !== id),
        false
      );

      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete collection');
      
      // Revalidate
      await mutate();
      return true;
    } catch (err) {
      // Revalidate on error
      await mutate();
      throw err;
    }
  };

  const publishCollection = async (id: string, htmlContent: string) => {
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionId: id,
          content: htmlContent
        }),
      });
  
      if (!response.ok) throw new Error('Failed to publish');
      const { url } = await response.json();
      
      await updateCollection(id, { publishedUrl: url });
      return url;
    } catch (err) {
      console.error('Failed to publish collection:', err);
      throw err;
    }
  };

  const unpublishCollection = async (id: string) => {
    try {
      const collection = collections.find(c => c.id === id);
      if (!collection?.publishedUrl) {
        throw new Error('Collection is not published');
      }
  
      // Optimistic update
      mutate(
        collections.map(c => 
          c.id === id 
            ? { ...c, publishedUrl: undefined }
            : c
        ),
        false
      );
  
      const response = await fetch('/api/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: id }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to unpublish');
      }
  
      // Revalidate after successful unpublish
      await mutate();
      return true;
    } catch (error) {
      // Revalidate to restore the correct state
      await mutate();
      console.error('Failed to unpublish collection:', error);
      throw error;
    }
  };

  return {
    collections,
    loading: !error && !collections,
    error: error?.message,
    createCollection,
    updateCollection,
    deleteCollection,
    publishCollection,
    unpublishCollection,
    refreshCollections: () => mutate()
  };
}