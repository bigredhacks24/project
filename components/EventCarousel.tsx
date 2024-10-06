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
    <div className="relative flex items-start gap-3 self-stretch">
      <div className="flex h-[313px] items-start gap-3 self-stretch overflow-hidden">
        {currentEvents.map((event: EventWithAttendance) => (
          <EventCard key={event.event_id} eventAttendance={event} />
        ))}
      </div>
      {events.length > eventsPerPage && (
        <button
          onClick={nextPage}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default EventCarousel;