'use client';

import React, { useState } from 'react';
import EventCard from "@/components/EventCard";
import { EventWithAttendance } from "@/types/general-types";

interface EventCarouselProps {
  events: EventWithAttendance[];
  onEventClick: (event: EventWithAttendance) => void;
}

const EventCarousel: React.FC<EventCarouselProps> = ({ events, onEventClick }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const eventsPerPage = 5;

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = currentPage * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <div className={`relative grid items-start gap-3 self-stretch`}>
      <div className="grid grid-cols-5 items-start gap-3">
        {currentEvents.map((event: EventWithAttendance) => (
          <div key={event.event_id} onClick={() => onEventClick(event)}>
            <EventCard eventWithAttendance={event} />
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default EventCarousel;;