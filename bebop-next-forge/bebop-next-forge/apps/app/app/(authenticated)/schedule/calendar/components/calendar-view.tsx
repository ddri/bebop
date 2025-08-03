'use client';

import type {
  DateClickArg,
  EventClickArg,
  EventDropArg,
} from '@fullcalendar/core';
import { Badge } from '@repo/design-system/components/ui/badge';
import { Button } from '@repo/design-system/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  Suspense,
  lazy,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { toast } from 'sonner';
import { Icons } from '../../../../../components/icons';

// Lazy load the FullCalendar component
const LazyCalendar = lazy(() =>
  import('./lazy-calendar').then((module) => ({ default: module.LazyCalendar }))
);
import type {
  CampaignStatus,
  ContentType,
  DestinationType,
  Schedule,
  ScheduleStatus,
} from '@repo/database/types';
import { CalendarFilters } from './calendar-filters';
import { CreateScheduleModal } from './create-schedule-modal';
import { EditScheduleModal } from './edit-schedule-modal';

export interface CalendarViewProps {
  schedules: (Schedule & {
    content: {
      id: string;
      title: string;
      body: string;
      excerpt: string | null;
      type: ContentType;
    };
    campaign: {
      id: string;
      name: string;
      status: CampaignStatus;
    };
    destination: {
      id: string;
      name: string;
      type: DestinationType;
    };
  })[];
  destinations: {
    id: string;
    name: string;
    type: DestinationType;
  }[];
  campaigns: {
    id: string;
    name: string;
    status: CampaignStatus;
  }[];
}

// Platform color mapping
const PLATFORM_COLORS = {
  HASHNODE: '#2962FF',
  DEVTO: '#000000',
  BLUESKY: '#00D4FF',
  MASTODON: '#6364FF',
  TWITTER: '#1DA1F2',
  LINKEDIN: '#0077B5',
  FACEBOOK: '#1877F2',
  INSTAGRAM: '#E4405F',
  WORDPRESS: '#21759B',
  GHOST: '#15171A',
  CUSTOM: '#6B7280',
  SENDGRID: '#1A82E2',
} as const;

// Status color mapping
const STATUS_COLORS = {
  PENDING: '#FFA726',
  PUBLISHING: '#42A5F5',
  PUBLISHED: '#26A69A',
  FAILED: '#EF5350',
  CANCELLED: '#9E9E9E',
} as const;

export const CalendarView = ({
  schedules,
  destinations,
  campaigns,
}: CalendarViewProps) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<DestinationType[]>(
    []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<ScheduleStatus[]>(
    []
  );
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<
    CalendarViewProps['schedules'][0] | null
  >(null);
  const [_isPending, startTransition] = useTransition();
  const router = useRouter();

  // Convert schedules to FullCalendar events
  const calendarEvents = useMemo(() => {
    return schedules
      .filter((schedule) => {
        // Apply platform filters
        if (
          selectedPlatforms.length > 0 &&
          !selectedPlatforms.includes(schedule.destination.type)
        ) {
          return false;
        }

        // Apply status filters
        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(schedule.status)
        ) {
          return false;
        }

        // Apply campaign filters
        if (
          selectedCampaigns.length > 0 &&
          !selectedCampaigns.includes(schedule.campaign.id)
        ) {
          return false;
        }

        return true;
      })
      .map((schedule) => ({
        id: schedule.id,
        title: schedule.content.title,
        start: schedule.publishAt,
        backgroundColor:
          PLATFORM_COLORS[
            schedule.destination.type as keyof typeof PLATFORM_COLORS
          ] || PLATFORM_COLORS.CUSTOM,
        borderColor:
          STATUS_COLORS[schedule.status as keyof typeof STATUS_COLORS],
        textColor:
          schedule.destination.type === 'DEVTO' ? '#FFFFFF' : '#FFFFFF',
        extendedProps: {
          schedule,
          platform: schedule.destination.type,
          status: schedule.status,
          campaignName: schedule.campaign.name,
          destinationName: schedule.destination.name,
          excerpt: schedule.content.excerpt,
        },
        classNames: [`schedule-event-${schedule.status.toLowerCase()}`],
        editable:
          schedule.status === 'PENDING' &&
          new Date(schedule.publishAt) > new Date(),
      }));
  }, [schedules, selectedPlatforms, selectedStatuses, selectedCampaigns]);

  const handleDateClick = (dateInfo: DateClickArg) => {
    setSelectedDate(new Date(dateInfo.date));
    setShowCreateModal(true);
  };

  const handleEventClick = (eventInfo: EventClickArg) => {
    const schedule = eventInfo.event.extendedProps.schedule;
    setSelectedSchedule(schedule);
    setShowEditModal(true);
  };

  const handleEventDrop = useCallback(
    async (eventInfo: EventDropArg) => {
      const scheduleId = eventInfo.event.id;
      const newDate = eventInfo.event.start;
      const oldDate = eventInfo.oldEvent.start;
      const schedule = eventInfo.event.extendedProps.schedule;

      if (!newDate) {
        toast.error('Invalid date');
        eventInfo.revert();
        return;
      }

      // Prevent moving to past dates
      if (newDate < new Date()) {
        toast.error('Cannot schedule content in the past');
        eventInfo.revert();
        return;
      }

      // Show confirmation if moving more than 7 days
      const daysDiff = Math.abs(
        (newDate.getTime() - (oldDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff > 7) {
        const confirmed = window.confirm(
          `Are you sure you want to reschedule "${schedule.content.title}" to ${newDate.toLocaleDateString()}?`
        );
        if (!confirmed) {
          eventInfo.revert();
          return;
        }
      }

      // Optimistically update UI
      const toastId = toast.loading('Rescheduling content...');

      try {
        const response = await fetch(`/api/schedule/${scheduleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publishAt: newDate.toISOString(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update schedule');
        }

        toast.success('Content rescheduled successfully', { id: toastId });

        // Refresh the page to get updated data
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to reschedule content',
          { id: toastId }
        );
        // Revert the drag operation
        eventInfo.revert();
      }
    },
    [router]
  );

  const handleEventResize = useCallback(
    async (eventInfo: {
      event: { id: string; start: Date | null };
      revert: () => void;
    }) => {
      // For now, we'll just use the start time since we don't have duration in our schema
      const scheduleId = eventInfo.event.id;
      const newDate = eventInfo.event.start;

      if (!newDate) {
        toast.error('Invalid date');
        eventInfo.revert();
        return;
      }

      // Prevent moving to past dates
      if (newDate < new Date()) {
        toast.error('Cannot schedule content in the past');
        eventInfo.revert();
        return;
      }

      const toastId = toast.loading('Updating schedule time...');

      try {
        const response = await fetch(`/api/schedule/${scheduleId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            publishAt: newDate.toISOString(),
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update schedule');
        }

        toast.success('Schedule time updated', { id: toastId });

        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Failed to update schedule time',
          { id: toastId }
        );
        eventInfo.revert();
      }
    },
    [router]
  );

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.calendar className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Content Calendar</h2>
          <Badge variant="secondary" className="ml-2">
            {calendarEvents.length} scheduled
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Icons.filter className="h-4 w-4" />
            Filters
          </Button>

          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Icons.plus className="h-4 w-4" />
            Schedule Content
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <CalendarFilters
          destinations={destinations}
          campaigns={campaigns}
          selectedPlatforms={selectedPlatforms}
          setSelectedPlatforms={setSelectedPlatforms}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedCampaigns={selectedCampaigns}
          setSelectedCampaigns={setSelectedCampaigns}
        />
      )}

      {/* Calendar Container */}
      <div className="rounded-lg border bg-card">
        <div className="p-4">
          <Suspense
            fallback={
              <div className="flex h-96 items-center justify-center rounded-lg bg-muted/20">
                <div className="space-y-2 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
                  <p className="text-muted-foreground text-sm">
                    Loading calendar...
                  </p>
                </div>
              </div>
            }
          >
            <LazyCalendar
              calendarEvents={calendarEvents}
              handleDateClick={handleDateClick}
              handleEventClick={handleEventClick}
              handleEventDrop={handleEventDrop}
              handleEventResize={handleEventResize}
            />
          </Suspense>
        </div>
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDate(null);
          }}
          initialDate={selectedDate}
          destinations={destinations}
          campaigns={campaigns}
        />
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && selectedSchedule && (
        <EditScheduleModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          schedule={selectedSchedule}
          onUpdate={() => {
            startTransition(() => {
              router.refresh();
            });
          }}
        />
      )}

      {/* Custom CSS for platform styling */}
      <style jsx global>{`
        .fc-event {
          border-radius: 6px !important;
          border-width: 2px !important;
          font-size: 12px !important;
          padding: 2px 4px !important;
          cursor: pointer !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        
        .fc-event[draggable="true"] {
          cursor: move !important;
        }
        
        .fc-event:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        
        .fc-event-dragging {
          opacity: 0.75 !important;
          transform: scale(1.05) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          z-index: 9999 !important;
        }
        
        .fc-event-title {
          font-weight: 500 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        
        .fc-daygrid-event {
          margin: 1px 2px !important;
        }
        
        .fc-timegrid-event {
          border-radius: 4px !important;
        }
        
        .schedule-event-failed {
          opacity: 0.7;
        }
        
        .schedule-event-cancelled {
          opacity: 0.6;
          text-decoration: line-through;
        }
        
        .schedule-event-published {
          opacity: 0.8;
        }
        
        .fc-more-link {
          color: #6366f1 !important;
          font-weight: 500 !important;
        }
        
        .fc-daygrid-day:hover {
          background-color: #f8fafc !important;
        }
        
        .fc-highlight {
          background-color: #e0e7ff !important;
          opacity: 0.3 !important;
        }
        
        .fc-event-resizing {
          opacity: 0.75 !important;
        }
        
        .fc-event.schedule-event-published {
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }
        
        .fc-event.schedule-event-failed {
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
};
