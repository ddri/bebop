'use client';

import type { EventClickArg, EventDropArg, DateClickArg } from '@fullcalendar/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ScheduleEventCard } from './schedule-event-card';

interface LazyCalendarProps {
  calendarEvents: any[];
  handleDateClick: (dateInfo: DateClickArg) => void;
  handleEventClick: (eventInfo: EventClickArg) => void;
  handleEventDrop: (eventInfo: EventDropArg) => void;
  handleEventResize: (eventInfo: any) => void;
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
        return [
          `platform-${arg.event.extendedProps.platform.toLowerCase()}`,
        ];
      }}
    />
  );
};