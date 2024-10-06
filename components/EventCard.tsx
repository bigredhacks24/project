import React, { useState, useEffect } from "react";
import type { EventWithAttendance } from "@/types/general-types";
import { createClient } from "@/utils/supabase/client";
import { Check } from "lucide-react";
import { getColorFromString } from "@/utils/utils";

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
  const [isAttending, setIsAttending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndThumbnail = async () => {
      const supabase = createClient();

      // Fetch current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
      } else if (user) {
        setCurrentUserId(user.id);
        // Set initial attendance state
        const userAttendance = eventWithAttendance.event_person_attendance.find(
          (attendance) => attendance.person.person_id === user.id
        );
        setIsAttending(userAttendance?.attending || false);
      }

      // Fetch thumbnail
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

    fetchUserAndThumbnail();
  }, [eventWithAttendance.event_id, eventWithAttendance.event_person_attendance]);

  const eventTime = formatEventTime(
    eventWithAttendance.start_timestamp,
    eventWithAttendance.end_timestamp
  );

  const isUpcoming = new Date(eventWithAttendance.start_timestamp) > new Date();

  const toggleAttendance = async () => {
    if (!currentUserId) return;

    const newAttendingState = !isAttending;
    setIsAttending(newAttendingState);

    const supabase = createClient();
    const { error } = await supabase
      .from("event_person_attendance")
      .upsert({
        event_id: eventWithAttendance.event_id,
        person_id: currentUserId,
        attending: newAttendingState,
      });

    if (error) {
      console.error("Error updating attendance:", error);
      setIsAttending(!newAttendingState); // Revert state if update fails
    }
  };

  // Get the background color based on the group name
  const groupColor = eventWithAttendance.group ? getColorFromString(eventWithAttendance.group.name) : '#5D6DEB';

  return (
    <div className="relative flex flex-col items-start gap-[16px] rounded-[6px] border border-[#E4E4E7] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)] cursor-pointer overflow-hidden">
      <div 
        className="w-full h-48 overflow-hidden"
        style={{
          backgroundColor: groupColor,
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
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: groupColor }} />
            <div className="text-[#71717A] font-inter text-xs font-normal leading-[1.2]">
              {eventWithAttendance.group?.name}
            </div>
          </div>
        </div>
      </div>
      {isUpcoming && currentUserId && (
        <div 
          className={`absolute bottom-4 right-4 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${isAttending ? 'bg-green-500' : 'bg-white'} border border-gray-300`}
          onClick={(e) => {
            e.stopPropagation();
            toggleAttendance();
          }}
        >
          <Check className={`w-4 h-4 transition-colors duration-200 ${isAttending ? 'text-white' : 'text-gray-300'}`} />
        </div>
      )}
    </div>
  );
};

export default EventCard;