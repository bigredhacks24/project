'use client';

import React, { useState } from 'react';
import EventCard from "@/components/EventCard";
import { EventWithAttendance } from "@/types/general-types";

interface EventCarouselProps {
  events: EventWithAttendance[];
  onEventClick: (event: EventWithAttendance) => void;
}

const EventCarousel: React.FC<EventCarouselProps> = ({ events, onEventClick }) => {
  return (
    <div className={`relative grid items-start gap-3 self-stretch`}>
      <div className="flex flex-row items-start gap-3 overflow-x-scroll">
        {events.map((event: EventWithAttendance) => (
          <div key={event.event_id} onClick={() => onEventClick(event)} className="flex-shrink-0 w-[240px]">
            <EventCard eventWithAttendance={event} />
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default EventCarousel;;