'use client';

import type {
  DateClickArg,
  EventClickArg,
  EventDropArg,
} from '@fullcalendar/core';
import type { CalendarViewProps } from './calendar-view';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { ScheduleEventCard } from './schedule-event-card';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    schedule: CalendarViewProps['schedules'][0];
    platform: string;
    status: string;
    campaignName: string;
    destinationName: string;
    excerpt: string | null;
  };
  classNames: string[];
  editable: boolean;
}

interface EventResizeInfo {
  event: {
    id: string;
    start: Date | null;
  };
  revert: () => void;
}

interface LazyCalendarProps {
  calendarEvents: CalendarEvent[];
  handleDateClick: (dateInfo: DateClickArg) => void;
  handleEventClick: (eventInfo: EventClickArg) => void;
  handleEventDrop: (eventInfo: EventDropArg) => void;
  handleEventResize: (eventInfo: EventResizeInfo) => void;
}

export const LazyCalendar = ({
  calendarEvents,
  handleDateClick,
  handleEventClick,
  handleEventDrop,
  handleEventResize,
}: LazyCalendarProps) => {
  return (
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
      eventResize={handleEventResize}
      height="auto"
      eventDisplay="block"
      dayMaxEvents={3}
      moreLinkClick="popover"
      eventDurationEditable={false}
      eventStartEditable={true}
      eventConstraint={{
        start: new Date().toISOString(),
        end: '2100-01-01',
      }}
      eventContent={(eventInfo) => (
        <ScheduleEventCard
          title={eventInfo.event.title}
          platform={eventInfo.event.extendedProps.platform}
          status={eventInfo.event.extendedProps.status}
          destinationName={eventInfo.event.extendedProps.destinationName}
          time={eventInfo.event.start}
        />
      )}
      eventClassNames={(arg) => {
        return [`platform-${arg.event.extendedProps.platform.toLowerCase()}`];
      }}
    />
  );
};
