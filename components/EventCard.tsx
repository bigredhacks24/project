import React from "react";
import type { EventWithAttendance } from "@/types/general-types";
// import type { Database } from "@/types/database.types";

interface EventCardProps {
  eventWithAttendance: EventWithAttendance;
}

// Function to format the timestamp into a readable time string
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
    .replace(/ AM| PM/, "") // Remove AM/PM from start time
    .replace(/:00$/, ""); // Remove ":00" from start time if it exists
  const formattedEndTime = endDate
    .toLocaleString("en-US", timeOptions)
    .replace(/:00$/, "");
  console.log("END: " + formattedEndTime);
  return `${formattedStartDate}, ${formattedStartTime} - ${formattedEndTime}`;
};

const EventCard: React.FC<EventCardProps> = ({ eventWithAttendance }) => {
  const eventTime = formatEventTime(
    eventWithAttendance.start_timestamp,
    eventWithAttendance.end_timestamp
  );

  return (
    <div className="flex p-[18px] flex-col items-start gap-[16px] flex-[1_0_0] self-stretch rounded-[6px] border border-[#E4E4E7] bg-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.10),0px_2px_4px_-2px_rgba(0,0,0,0.10)] cursor-pointer">
      <div className="flex items-start gap-[16px] flex-[1_0_0] self-stretch">
        <div className="flex flex-col justify-center items-start gap-[16px] flex-[1_0_0] self-stretch">
          <div className="flex p-[12px_11.8px_152px_63px] justify-end items-center flex-[1_0_0] self-stretch rounded-[6px] bg-[#5D6DEB]">
          </div>
          <div className="flex flex-col items-start gap-[10px] self-stretch">
            <div className="flex flex-col items-start gap-[4px] self-stretch">
              <div className="flex items-start self-stretch">
                <div className="flex h-5 items-start">
                  <div className="flex justify-center items-center gap-2.5">
                    <div className="text-[#09090B] font-inter text-sm font-semibold leading-[1.2]">
                      <p>{eventWithAttendance.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start self-stretch">
                <div className="text-[#09090B] font-inter text-sm font-normal leading-[1.4]">
                  <p>{eventTime}</p>
                </div>
              </div>
              <div className="flex pt-2 items-center gap-1 self-stretch">
                <div className="flex w-4 h-4 pr-2 flex-col items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle cx="8" cy="8" r="8" fill="#5D6DEB" />
                  </svg>
                </div>
                <div className="flex flex-col items-start">
                  <div className="text-[#71717A] font-inter text-xs font-normal leading-[1.2]">
                    <div className="text-[#71717A] font-inter text-xs font-normal leading-[1.2]">
                      <p>{eventWithAttendance.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
