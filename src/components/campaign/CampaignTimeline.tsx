'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  ZoomIn,
  ZoomOut,
  Filter,
  Clock,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCampaignTimeline, TimelineEvent, TimelineViewMode } from '@/hooks/useCampaignTimeline';
import { ContentStaging, ManualTask, PublishingPlan } from '@/types/campaigns';

interface CampaignTimelineProps {
  campaignId: string;
  stagingItems: ContentStaging[];
  tasks: ManualTask[];
  publishingPlans: PublishingPlan[];
  topics: Array<{ id: string; name: string; description?: string }>;
  onEventClick?: (event: TimelineEvent) => void;
  loading?: boolean;
}

const TimelineEventCard: React.FC<{ 
  event: TimelineEvent; 
  onClick?: () => void;
  hourWidth: number;
}> = ({ event, onClick, hourWidth }) => {
  const getIcon = () => {
    switch (event.type) {
      case 'staging':
        return <FileText className="w-3 h-3" />;
      case 'publishing':
        return <Globe className="w-3 h-3" />;
      case 'task':
        return event.status === 'completed' ? 
          <CheckCircle2 className="w-3 h-3" /> : 
          <Clock className="w-3 h-3" />;
    }
  };

  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-500',
      ready: 'bg-yellow-500',
      scheduled: 'bg-blue-500',
      published: 'bg-green-500',
      failed: 'bg-red-500',
      todo: 'bg-purple-500',
      in_progress: 'bg-amber-500',
      completed: 'bg-green-500'
    };

    return (
      <div 
        className={`w-2 h-2 rounded-full ${statusColors[event.status] || 'bg-gray-500'}`}
        title={event.status}
      />
    );
  };

  // Calculate width based on duration (for tasks with end dates)
  const duration = event.endDate ? 
    (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60) : 
    2; // Default 2 hours for events without end date
  const width = Math.max(hourWidth * duration, hourWidth * 2); // Minimum 2 hour width

  return (
    <div
      className="absolute top-0 rounded-md p-2 text-xs cursor-pointer hover:z-10 hover:shadow-lg transition-all"
      style={{ 
        backgroundColor: `${event.color}20`,
        borderLeft: `3px solid ${event.color}`,
        width: `${width}px`,
        minWidth: `${hourWidth * 2}px`
      }}
      onClick={onClick}
      title={`${event.title}\n${event.description || ''}`}
    >
      <div className="flex items-start gap-1">
        <div className="flex items-center gap-1 flex-shrink-0">
          {getIcon()}
          {getStatusBadge()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">{event.title}</div>
          {event.platform && (
            <div className="text-slate-400 text-[10px]">{event.platform}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const WeekView: React.FC<{
  events: TimelineEvent[];
  dateRange: { start: Date; end: Date };
  onEventClick?: (event: TimelineEvent) => void;
}> = ({ events, dateRange, onEventClick }) => {
  const days = [];
  const currentDate = new Date(dateRange.start);
  
  while (currentDate <= dateRange.end) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const hourWidth = 60; // pixels per hour
  const dayHeight = 80; // pixels per row

  // Group events by day
  const eventsByDay = new Map<string, TimelineEvent[]>();
  events.forEach(event => {
    const dayKey = event.startDate.toDateString();
    if (!eventsByDay.has(dayKey)) {
      eventsByDay.set(dayKey, []);
    }
    eventsByDay.get(dayKey)?.push(event);
  });

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="relative overflow-x-auto">
      {/* Timeline Header - Hours */}
      <div className="sticky top-0 z-20 bg-[#2a2a2a] border-b border-slate-700">
        <div className="flex">
          <div className="w-24 flex-shrink-0 p-2 text-xs text-slate-400 font-medium">
            Day
          </div>
          <div className="flex">
            {Array.from({ length: 24 }, (_, i) => (
              <div 
                key={i} 
                className="text-xs text-slate-400 text-center border-l border-slate-800"
                style={{ width: `${hourWidth}px` }}
              >
                {i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i-12}pm`}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Body - Days */}
      <div className="relative">
        {days.map((day, dayIndex) => {
          const dayEvents = eventsByDay.get(day.toDateString()) || [];
          const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNumber = day.getDate();
          const monthName = day.toLocaleDateString('en-US', { month: 'short' });

          return (
            <div 
              key={dayIndex} 
              className={`flex border-b border-slate-700 ${isToday(day) ? 'bg-blue-950/20' : ''}`}
              style={{ minHeight: `${dayHeight}px` }}
            >
              {/* Day Label */}
              <div className="w-24 flex-shrink-0 p-2 border-r border-slate-700">
                <div className="text-sm font-medium text-white">
                  {dayName}
                </div>
                <div className="text-xs text-slate-400">
                  {monthName} {dayNumber}
                </div>
                {isToday(day) && (
                  <Badge variant="outline" className="text-[10px] mt-1 text-blue-400 border-blue-400">
                    Today
                  </Badge>
                )}
              </div>

              {/* Day Timeline */}
              <div className="flex-1 relative" style={{ width: `${hourWidth * 24}px` }}>
                {/* Hour grid lines */}
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-slate-800"
                    style={{ left: `${i * hourWidth}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday(day) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                    style={{ 
                      left: `${(new Date().getHours() + new Date().getMinutes() / 60) * hourWidth}px` 
                    }}
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                )}

                {/* Events */}
                <div className="relative" style={{ minHeight: `${dayHeight - 1}px` }}>
                  {dayEvents.map((event, eventIndex) => {
                    const hourOffset = event.startDate.getHours() + event.startDate.getMinutes() / 60;
                    const topOffset = Math.min(eventIndex * 25, dayHeight - 30); // Stack events

                    return (
                      <div
                        key={event.id}
                        className="absolute"
                        style={{ 
                          left: `${hourOffset * hourWidth}px`,
                          top: `${topOffset}px`
                        }}
                      >
                        <TimelineEventCard
                          event={event}
                          onClick={() => onEventClick?.(event)}
                          hourWidth={hourWidth}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CampaignTimeline: React.FC<CampaignTimelineProps> = ({
  campaignId,
  stagingItems,
  tasks,
  publishingPlans,
  topics,
  onEventClick,
  loading = false
}) => {
  const {
    viewMode,
    setViewMode,
    getDateRange,
    getEventsInRange,
    selectedDate,
    goToToday,
    goToPrevious,
    goToNext
  } = useCampaignTimeline(
    campaignId,
    stagingItems,
    tasks,
    publishingPlans,
    topics
  );

  const dateRange = getDateRange();
  const visibleEvents = getEventsInRange();

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('en-US', { 
        weekday: 'long',
        ...options 
      });
    }
    
    return `${dateRange.start.toLocaleDateString('en-US', options)} - ${dateRange.end.toLocaleDateString('en-US', options)}`;
  };

  if (loading) {
    return (
      <Card className="bg-[#1c1c1e] border-slate-700">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading timeline...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1c1c1e] border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Campaign Timeline
          </CardTitle>
          
          {/* Timeline Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex gap-1 bg-[#2a2a2a] rounded-md p-1">
              {(['day', 'week', 'month'] as TimelineViewMode[]).map(mode => (
                <Button
                  key={mode}
                  size="sm"
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  onClick={() => setViewMode(mode)}
                  className={`text-xs capitalize ${
                    viewMode === mode ? 'bg-[#E669E8] text-white' : 'text-slate-400'
                  }`}
                >
                  {mode}
                </Button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={goToPrevious}
                className="text-slate-400 border-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={goToToday}
                className="text-slate-400 border-slate-700 px-3"
              >
                Today
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={goToNext}
                className="text-slate-400 border-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Date Range Display */}
            <div className="text-sm text-slate-400 ml-2">
              {formatDateRange()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Event Summary */}
        <div className="flex gap-4 p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-slate-400">Scheduled ({visibleEvents.filter(e => e.status === 'scheduled').length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-yellow-500 rounded" />
            <span className="text-slate-400">Ready ({visibleEvents.filter(e => e.status === 'ready').length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span className="text-slate-400">Tasks ({visibleEvents.filter(e => e.type === 'task').length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-slate-400">Published ({visibleEvents.filter(e => e.status === 'published' || e.status === 'completed').length})</span>
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-[#2a2a2a]">
          {viewMode === 'week' && (
            <WeekView 
              events={visibleEvents}
              dateRange={dateRange}
              onEventClick={onEventClick}
            />
          )}
          {viewMode !== 'week' && (
            <div className="p-8 text-center text-slate-400">
              {viewMode === 'day' ? 'Day' : 'Month'} view coming soon...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignTimeline;