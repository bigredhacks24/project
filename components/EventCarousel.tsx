'use client';

import React, { useState } from 'react';
import EventCard from "@/components/EventCard";

interface EventWithAttendance {
  event_id: string;
  group_id: string | null;
  name: string;
  creation_timestamp: string;
  start_timestamp: string;
  end_timestamp: string;
  event_person_attendance: { attending: boolean | null }[];
}

interface EventCarouselProps {
  events: EventWithAttendance[];
}

const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
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
    <div className="relative w-full">
      <div className="flex overflow-x-auto space-x-4 h-[313px] w-full scrollbar-hide">
      {events.map((event: EventWithAttendance) => (
          <div key={event.event_id} className="min-w-[calc(100%/5)] shrink-0">
            <EventCard eventAttendance={event} />
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default EventCarousel;