import { useState, useEffect } from 'react';

interface Topic {
  id: string;
  name: string;
  content: string;
  description: string;
  createdAt: string;
}

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async (name: string, content: string, description: string) => {
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, content, description }),
      });
      if (!response.ok) throw new Error('Failed to create topic');
      await fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic');
      throw err;
    }
  };

  const updateTopic = async (id: string, name: string, content: string, description: string) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, content, description }),
      });
      if (!response.ok) throw new Error('Failed to update topic');
      await fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic');
      throw err;
    }
  };

  const deleteTopic = async (id: string) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete topic');
      await fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete topic');
      throw err;
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return {
    topics,
    loading,
    error,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}