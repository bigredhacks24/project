"use client";

import { useState } from "react";
import EventCard from "@/components/EventCard";
import PersonCard from "@/components/PersonCard";
import CirclesCard from "@/components/CirclesCard";
import CreateCircleButton from "@/components/CreateCircleButton";
import EventCarousel from "@/components/EventCarousel";
import EventModal from "@/components/EventModal";
import PlanModal from "@/components/PlanModal";
import EventModalButton from "@/components/EventModalButton";
import { Friend, Group } from "@/types/general-types";

interface EventWithAttendance extends Event {
  event_person_attendance: { attending: boolean | null }[];
}

interface HomeClientProps {
  events: Event[];
  friends: Friend[];
  groups: Group[];
}

interface Event {
  creation_timestamp: string;
  end_timestamp: string;
  event_id: string;
  group_id: string | null;
  name: string;
  start_timestamp: string;
  event_person_attendance: { attending: boolean | null }[];
}

interface EventData {
  name: string;
  inviteCircle: string;
  date: string;
  duration: string;
  startTime: string;
  endTime: string;
}

export default function HomeClient({
  events,
  friends,
  groups,
}: HomeClientProps) {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [eventData, setEventData] = useState<EventData>({
    name: "",
    inviteCircle: "",
    date: "",
    duration: "",
    startTime: "",
    endTime: "",
  });

  const handleEventModalClose = () => {
    setIsEventModalOpen(false);
    setEventData({
      name: "",
      inviteCircle: "",
      date: "",
      duration: "",
      startTime: "",
      endTime: "",
    });
  };

  const handlePlanModalClose = () => {
    setIsPlanModalOpen(false);
    setEventData({
      name: "",
      inviteCircle: "",
      date: "",
      duration: "",
      startTime: "",
      endTime: "",
    });
  };

  const handleNext = (data: EventData) => {
    setEventData(data);
    setIsEventModalOpen(false);
    setIsPlanModalOpen(true);
  };

  const handleBack = () => {
    setIsPlanModalOpen(false);
    setIsEventModalOpen(true);
  };

  return (
    <div className="flex w-[1222px] h-[881px] flex-col items-start gap-[72px] shrink-0">
      <div className="flex flex-col items-start gap-[24px] self-stretch">
        <div className="w-full flex flex-col items-start gap-6">
          {/* Flexbox to align the heading and button in the same row */}
          <div className="flex justify-between items-center">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Upcoming Events
            </div>
            <div className="ml-[20px]">
              <EventModalButton onOpen={() => setIsEventModalOpen(true)} />
            </div>
          </div>
          <EventCarousel events={events as EventWithAttendance[]} />
        </div>
      </div>
      <div className="flex w-[1222px] items-start gap-9">
        <div className="flex h-[291px] flex-col items-start gap-6 flex-[1_0_0]">
          <div className="flex items-start gap-6">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Your Circles
            </div>
            <CreateCircleButton />
          </div>
          <div className="flex flex-wrap gap-4 w-full">
            {groups &&
              groups.map((group: Group) => (
                <div key={group.group_id} className="w-[calc(33.333%-16px)]">
                  <CirclesCard group={group} eventCount={0} />
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-6 flex-[1_0_0]">
          <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
            Your Friends
          </div>
          <div className="flex flex-col items-start gap-[8px] self-stretch">
            {friends &&
              friends.map((friend: Friend) => (
                <PersonCard key={friend.person_id} friend={friend} />
              ))}
          </div>
        </div>
      </div>
      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleEventModalClose}
        onNext={handleNext}
        groups={groups}
        initialData={eventData}
      />
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={handlePlanModalClose}
        onBack={handleBack}
        eventData={eventData}
      />
    </div>
  );
}
