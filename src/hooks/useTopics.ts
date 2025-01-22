import useSWR from 'swr';

interface Topic {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch topics');
  }
  return response.json();
};

export function useTopics() {
  const { data: topics = [], error, mutate } = useSWR<Topic[]>('/api/topics', fetcher);

  // Create a new topic
  const createTopic = async (name: string, content: string) => {
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content })
      });
      if (!response.ok) throw new Error('Failed to create topic');
      const newTopic = await response.json();
      
      // Optimistically update the local data
      mutate(current => [newTopic, ...(current || [])], false);
      
      // Revalidate
      await mutate();
      return newTopic;
    } catch (err) {
      console.error('Failed to create topic:', err);
      // Revalidate on error to ensure UI is in sync
      await mutate();
      throw err;
    }
  };

  // Update an existing topic
  const updateTopic = async (id: string, name: string, content: string) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content })
      });
      if (!response.ok) throw new Error('Failed to update topic');
      const updatedTopic = await response.json();
      
      // Optimistically update the local data
      mutate(
        current => (current || []).map(topic => 
          topic.id === id ? updatedTopic : topic
        ),
        false
      );
      
      // Revalidate
      await mutate();
      return updatedTopic;
    } catch (err) {
      console.error('Failed to update topic:', err);
      await mutate();
      throw err;
    }
  };

  // Delete a topic
  const deleteTopic = async (id: string) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete topic');
      
      // Optimistically update the local data
      mutate(
        current => (current || []).filter(topic => topic.id !== id),
        false
      );
      
      // Revalidate
      await mutate();
    } catch (err) {
      console.error('Failed to delete topic:', err);
      await mutate();
      throw err;
    }
  };

  return {
    topics,
    loading: !error && !topics,
    error: error?.message,
    createTopic,
    updateTopic,
    deleteTopic,
    refreshTopics: () => mutate()
  };
}