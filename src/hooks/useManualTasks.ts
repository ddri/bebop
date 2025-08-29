import { useState, useCallback, useEffect } from 'react';

export interface ManualTask {
  id: string;
  campaignId: string;
  contentStagingId?: string;
  title: string;
  description?: string;
  platform?: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  completedAt?: string;
  instructions?: string;
  notes?: string;
  campaign: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateManualTaskInput {
  campaignId: string;
  contentStagingId?: string;
  title: string;
  description?: string;
  platform?: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  instructions?: string;
  notes?: string;
}

export interface UpdateManualTaskInput {
  title?: string;
  description?: string;
  platform?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  instructions?: string;
  notes?: string;
}

export const useManualTasks = (campaignId?: string) => {
  const [tasks, setTasks] = useState<ManualTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchManualTasks = useCallback(async () => {
    if (!campaignId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks?campaignId=${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch manual tasks');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchManualTasks();
  }, [fetchManualTasks]);

  const createManualTask = useCallback(async (input: CreateManualTaskInput) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create manual task');
      }

      const newTask = await response.json();
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  const updateManualTask = useCallback(async (id: string, data: UpdateManualTaskInput) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update manual task');
      }

      const updatedTask = await response.json();
      setTasks(prev => 
        prev.map(task => 
          task.id === id ? updatedTask : task
        )
      );
      return updatedTask;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  const deleteManualTask = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete manual task');
      }

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    }
  }, []);

  // Helper functions for task management
  const markAsInProgress = useCallback(async (id: string) => {
    return updateManualTask(id, { status: 'in_progress' });
  }, [updateManualTask]);

  const markAsCompleted = useCallback(async (id: string) => {
    return updateManualTask(id, { 
      status: 'completed'
    });
  }, [updateManualTask]);

  const markAsTodo = useCallback(async (id: string) => {
    return updateManualTask(id, { status: 'todo' });
  }, [updateManualTask]);

  // Get tasks by status
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  // Get tasks by platform
  const getTasksByPlatform = useCallback((platform: string) => {
    return tasks.filter(task => task.platform === platform);
  }, [tasks]);

  return {
    tasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
    loading,
    error,
    createManualTask,
    updateManualTask,
    deleteManualTask,
    markAsInProgress,
    markAsCompleted,
    markAsTodo,
    getTasksByPlatform,
    refetch: fetchManualTasks,
  };
};

export default useManualTasks;