'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useMemo } from 'react';
import { Button } from '@repo/design-system/components/ui/button';
import { Badge } from '@repo/design-system/components/ui/badge';
import type { 
  Schedule, 
  ScheduleStatus, 
  ContentType, 
  DestinationType,
  CampaignStatus
} from '@repo/database/types';
import { Calendar, Filter, Plus } from 'lucide-react';
import { CalendarFilters } from './calendar-filters';
import { ScheduleEventCard } from './schedule-event-card';
import { CreateScheduleModal } from './create-schedule-modal';

interface CalendarViewProps {
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

export const CalendarView = ({ schedules, destinations, campaigns }: CalendarViewProps) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<DestinationType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ScheduleStatus[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Convert schedules to FullCalendar events
  const calendarEvents = useMemo(() => {
    return schedules
      .filter(schedule => {
        // Apply platform filters
        if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(schedule.destination.type)) {
          return false;
        }
        
        // Apply status filters
        if (selectedStatuses.length > 0 && !selectedStatuses.includes(schedule.status)) {
          return false;
        }
        
        // Apply campaign filters
        if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(schedule.campaign.id)) {
          return false;
        }
        
        return true;
      })
      .map(schedule => ({
        id: schedule.id,
        title: schedule.content.title,
        start: schedule.publishAt,
        backgroundColor: PLATFORM_COLORS[schedule.destination.type as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.CUSTOM,
        borderColor: STATUS_COLORS[schedule.status as keyof typeof STATUS_COLORS],
        textColor: schedule.destination.type === 'DEVTO' ? '#FFFFFF' : '#FFFFFF',
        extendedProps: {
          schedule,
          platform: schedule.destination.type,
          status: schedule.status,
          campaignName: schedule.campaign.name,
          destinationName: schedule.destination.name,
          excerpt: schedule.content.excerpt,
        },
        classNames: [`schedule-event-${schedule.status.toLowerCase()}`],
      }));
  }, [schedules, selectedPlatforms, selectedStatuses, selectedCampaigns]);

  const handleDateClick = (dateInfo: { date: Date }) => {
    setSelectedDate(new Date(dateInfo.date));
    setShowCreateModal(true);
  };

  const handleEventClick = (eventInfo: { event: { extendedProps: { schedule: unknown } } }) => {
    // Handle event click - could open edit modal
    console.log('Event clicked:', eventInfo.event.extendedProps.schedule);
  };

  const handleEventDrop = (eventInfo: { event: { start: Date; id: string } }) => {
    // Handle drag and drop - will implement in next phase
    console.log('Event dropped:', eventInfo);
    // TODO: API call to update schedule
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Content Calendar</h2>
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
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
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
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            editable={true}
            droppable={true}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventContent={(eventInfo) => (
              <ScheduleEventCard
                title={eventInfo.event.title}
                platform={eventInfo.event.extendedProps.platform}
                status={eventInfo.event.extendedProps.status}
                destinationName={eventInfo.event.extendedProps.destinationName}
                time={eventInfo.event.start}
              />
            )}
            // Custom styling
            eventClassNames={(arg) => {
              return [`platform-${arg.event.extendedProps.platform.toLowerCase()}`];
            }}
          />
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

      {/* Custom CSS for platform styling */}
      <style jsx global>{`
        .fc-event {
          border-radius: 6px !important;
          border-width: 2px !important;
          font-size: 12px !important;
          padding: 2px 4px !important;
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
      `}</style>
    </div>
  );
};