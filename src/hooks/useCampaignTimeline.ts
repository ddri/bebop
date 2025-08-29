import { useState, useEffect, useCallback } from 'react';
import { ContentStaging, ManualTask, PublishingPlan } from '@/types/campaigns';

export type TimelineViewMode = 'day' | 'week' | 'month' | 'quarter';

export interface TimelineEvent {
  id: string;
  type: 'staging' | 'publishing' | 'task';
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  platform?: string;
  platforms?: string[];
  color: string;
  data: ContentStaging | ManualTask | PublishingPlan;
}

interface TimelineFilters {
  platforms?: string[];
  statuses?: string[];
  types?: ('staging' | 'publishing' | 'task')[];
  hideCompleted?: boolean;
}

const getEventColor = (type: TimelineEvent['type'], status: string): string => {
  if (type === 'staging') {
    switch (status) {
      case 'draft': return '#6B7280'; // gray
      case 'ready': return '#EAB308'; // yellow
      case 'scheduled': return '#3B82F6'; // blue
      default: return '#6B7280';
    }
  } else if (type === 'publishing') {
    switch (status) {
      case 'scheduled': return '#3B82F6'; // blue
      case 'published': return '#10B981'; // green
      case 'failed': return '#EF4444'; // red
      default: return '#3B82F6';
    }
  } else if (type === 'task') {
    switch (status) {
      case 'todo': return '#8B5CF6'; // purple
      case 'in_progress': return '#F59E0B'; // amber
      case 'completed': return '#10B981'; // green
      default: return '#8B5CF6';
    }
  }
  return '#6B7280';
};

export const useCampaignTimeline = (
  campaignId: string,
  stagingItems: ContentStaging[],
  tasks: ManualTask[],
  publishingPlans: PublishingPlan[],
  topics: Array<{ id: string; name: string; description?: string }>
) => {
  const [viewMode, setViewMode] = useState<TimelineViewMode>('week');
  const [filters, setFilters] = useState<TimelineFilters>({});
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Convert staging items to timeline events
  const stagingToTimeline = useCallback((items: ContentStaging[]): TimelineEvent[] => {
    return items.map(item => {
      const topic = topics.find(t => t.id === item.topicId);
      const startDate = item.scheduledFor ? new Date(item.scheduledFor) : new Date();
      
      return {
        id: `staging-${item.id}`,
        type: 'staging' as const,
        title: topic?.name || 'Unknown Content',
        description: `Status: ${item.status}`,
        startDate,
        status: item.status,
        platforms: item.platforms,
        color: getEventColor('staging', item.status),
        data: item
      };
    });
  }, [topics]);

  // Convert tasks to timeline events
  const tasksToTimeline = useCallback((items: ManualTask[]): TimelineEvent[] => {
    return items.map(task => {
      const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const endDate = task.completedAt ? new Date(task.completedAt) : undefined;
      
      return {
        id: `task-${task.id}`,
        type: 'task' as const,
        title: task.title,
        description: task.description,
        startDate,
        endDate,
        status: task.status,
        platform: task.platform,
        color: getEventColor('task', task.status),
        data: task
      };
    });
  }, []);

  // Convert publishing plans to timeline events
  const publishingToTimeline = useCallback((items: PublishingPlan[]): TimelineEvent[] => {
    return items.map(plan => {
      const topic = topics.find(t => t.id === plan.topicId);
      const startDate = plan.scheduledFor ? new Date(plan.scheduledFor) : 
                       plan.publishedAt ? new Date(plan.publishedAt) : new Date();
      
      return {
        id: `publishing-${plan.id}`,
        type: 'publishing' as const,
        title: topic?.name || 'Unknown Content',
        description: `Platform: ${plan.platform}`,
        startDate,
        status: plan.status,
        platform: plan.platform,
        color: getEventColor('publishing', plan.status),
        data: plan
      };
    });
  }, [topics]);

  // Aggregate all events
  useEffect(() => {
    const staging = stagingToTimeline(stagingItems);
    const taskEvents = tasksToTimeline(tasks);
    const publishing = publishingToTimeline(publishingPlans);
    
    let allEvents = [...staging, ...taskEvents, ...publishing];

    // Apply filters
    if (filters.platforms?.length) {
      allEvents = allEvents.filter(event => 
        event.platform && filters.platforms?.includes(event.platform) ||
        event.platforms?.some(p => filters.platforms?.includes(p))
      );
    }

    if (filters.statuses?.length) {
      allEvents = allEvents.filter(event => 
        filters.statuses?.includes(event.status)
      );
    }

    if (filters.types?.length) {
      allEvents = allEvents.filter(event => 
        filters.types?.includes(event.type)
      );
    }

    if (filters.hideCompleted) {
      allEvents = allEvents.filter(event => 
        !(event.status === 'completed' || event.status === 'published')
      );
    }

    // Sort by date
    allEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    setTimelineEvents(allEvents);
  }, [stagingItems, tasks, publishingPlans, stagingToTimeline, tasksToTimeline, publishingToTimeline, filters]);

  // Get date range for current view
  const getDateRange = useCallback((): { start: Date; end: Date } => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    switch (viewMode) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        const quarter = Math.floor(start.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(quarter * 3 + 3, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }, [selectedDate, viewMode]);

  // Get events for current view
  const getEventsInRange = useCallback((): TimelineEvent[] => {
    const { start, end } = getDateRange();
    return timelineEvents.filter(event => 
      event.startDate >= start && event.startDate <= end
    );
  }, [timelineEvents, getDateRange]);

  // Navigation functions
  const goToToday = () => setSelectedDate(new Date());
  
  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() - 3);
        break;
    }
    setSelectedDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarter':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
    }
    setSelectedDate(newDate);
  };

  return {
    viewMode,
    setViewMode,
    filters,
    setFilters,
    timelineEvents,
    selectedDate,
    setSelectedDate,
    getDateRange,
    getEventsInRange,
    goToToday,
    goToPrevious,
    goToNext
  };
};

export default useCampaignTimeline;