import React, { useState, useEffect } from "react";
import type { EventWithAttendance } from "@/types/general-types";

interface EventCardProps {
  eventWithAttendance: EventWithAttendance;
}

const formatEventTime = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "numeric",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const formattedStartDate = startDate.toLocaleString("en-US", dateOptions);
  const formattedStartTime = startDate
    .toLocaleString("en-US", timeOptions)
    .replace(/ AM| PM/, "")
    .replace(/:00$/, "");
  const formattedEndTime = endDate
    .toLocaleString("en-US", timeOptions)
    .replace(/:00$/, "");
  return `${formattedStartDate}, ${formattedStartTime} - ${formattedEndTime}`;
};

const EventCard: React.FC<EventCardProps> = ({ eventWithAttendance }) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await fetch(`/api/files?eventId=${eventWithAttendance.event_id}`);
        if (response.ok) {
          const files = await response.json();
          const thumbnailFile = files.find((file: any) => file.isThumbnail);
          if (thumbnailFile) {
            setThumbnail(thumbnailFile.url);
          }
        }
      } catch (error) {
        console.error("Error fetching thumbnail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThumbnail();
  }, [eventWithAttendance.event_id]);

  const eventTime = formatEventTime(
    eventWithAttendance.start_timestamp,
    eventWithAttendance.end_timestamp
  );

  return (
    <div className="flex flex-col items-start gap-[16px] rounded-[6px] border border-[#E4E4E7] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)] cursor-pointer overflow-hidden">
      <div 
        className="w-full h-48 bg-[#5D6DEB] overflow-hidden"
        style={{
          backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="flex flex-col items-start gap-[10px] p-4 w-full">
        <div className="flex flex-col items-start gap-[4px] self-stretch">
          <div className="text-[#09090B] font-inter text-lg font-semibold leading-[1.2]">
            {eventWithAttendance.name}
          </div>
          <div className="text-[#09090B] font-inter text-sm font-normal leading-[1.4]">
            {eventTime}
          </div>
          <div className="flex items-center gap-1 self-stretch mt-2">
            <div className="w-4 h-4 rounded-full bg-[#5D6DEB]" />
            <div className="text-[#71717A] font-inter text-xs font-normal leading-[1.2]">
              {eventWithAttendance.group?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;