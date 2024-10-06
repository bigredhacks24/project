"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import PersonCard from "@/components/PersonCard";
import CirclesCard from "@/components/CirclesCard";
import { Friend, Group } from "@/types/general-types";
import CreateCircleButton from "@/components/CreateCircleButton";
import EventCarousel from "@/components/EventCarousel";
import FileUploadAndGallery from "@/components/FileUploadAndGallery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Spinner from "@/components/Spinner";
import type { EventWithAttendance } from "@/types/general-types";
import InviteFriendButton from "@/components/InviteFriendButton";
import EventModal from "@/components/EventModal";
import PlanModal from "@/components/PlanModal";
import EventModalButton from "@/components/EventModalButton";

interface EventData {
  name: string;
  inviteCircle: string;
  date: string;
  duration: string;
  startTime: string;
  endTime: string;
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<EventWithAttendance[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedEventWithAttendance, setSelectedEventWithAttendance] =
    useState<EventWithAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);

        if (user) {
          // Fetch events
          const { data: eventsData, error: eventsError } = await supabase
            .from("event")
            .select(
              `
              *,
              event_person_attendance!inner (
                attending,
                person (
                  *
                )
              ),
              group (
                *
              )
            `
            )
            .eq("event_person_attendance.person_id", user.id)
            .gte("start_timestamp", new Date().toISOString())
            .order("start_timestamp", { ascending: true });
          if (eventsError) throw eventsError;
          setEvents(
            eventsData.map((event) => ({
              ...event,
              event_person_attendance: event.event_person_attendance.map(
                (attendance) => ({
                  attending: attendance.attending ?? false,
                  person: {
                    person_id: attendance.person?.person_id || "",
                    email: attendance.person?.email || "",
                    full_name: attendance.person?.full_name || "",
                    friends: attendance.person?.friends || [],
                    phone_number: attendance.person?.phone_number || "",
                    profile_picture: attendance.person?.profile_picture || "",
                    refresh_token: attendance.person?.refresh_token || "",
                  },
                })
              ),
            }))
          );

          // Fetch groups
          const { data: groupsData, error: groupsError } = await supabase.from(
            "group"
          ).select(`
              *,
              event_count:event(count),
              person_group:person(full_name, person_id)
            `);
          if (groupsError) throw groupsError;

          const transformedGroups = groupsData.reduce(
            (acc: any[], group: any) => {
              if (
                !acc.some((g) => g.group_id === group.group_id) &&
                group.person_group.some(
                  (person: any) => person.person_id === user.id
                )
              ) {
                acc.push({
                  ...group,
                  event_count: group.event_count[0] || { count: 0 },
                  members: group.person_group.map(
                    (name: string | null) => name || ""
                  ),
                });
              }
              return acc;
            },
            []
          );

          setGroups(transformedGroups);

          // Fetch friends
          const { data: friendsData, error: friendsError } = await supabase
            .from("person")
            .select("*")
            .neq("person_id", user.id);
          if (friendsError) throw friendsError;
          setFriends(friendsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEventClick = (event: EventWithAttendance) => {
    setSelectedEventWithAttendance(event);
  };

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

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="flex w-full flex-col items-start gap-[72px] shrink-0">
      <div className="flex flex-col items-start gap-[24px] self-stretch">
        <div className="w-full flex flex-col items-start gap-6">
          <div className="flex justify-between items-center">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Upcoming Events
            </div>
            <EventModalButton onOpen={() => setIsEventModalOpen(true)} />
          </div>
          <EventCarousel events={events} onEventClick={handleEventClick} />
        </div>
      </div>
      <div className="w-[1222px] items-start gap-9 grid grid-cols-2">
        <div>
          <div className="flex items-start gap-6">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Your Circles
            </div>
            <CreateCircleButton />
          </div>
          <div className="flex overflow-x-scroll gap-x-4 w-full mt-[45px]">
            {groups &&
              groups.map((group: Group) => (
                <div key={group.group_id}>
                  <CirclesCard
                    group={group}
                    eventCount={group.event_count?.count || 0}
                  />
                </div>
              ))}
            {!groups && <div>No circles found.</div>}
          </div>
        </div>
        <div>
          <div className="flex flex-col items-start gap-6 flex-[1_0_0]">
            <div className="flex items-center justify-between w-full">
              <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px] mr-4">
                Your Friends
              </div>
              <InviteFriendButton />
            </div>
            <div className="flex flex-col items-center gap-[8px] self-stretch justify-center overflow-y-scroll h-[400px] pt-20">
              {friends &&
                friends.map((friend: Friend) => (
                  <PersonCard key={friend.person_id} friend={friend} />
                ))}
            </div>
          </div>
        </div>

        <Dialog
          open={!!selectedEventWithAttendance}
          onOpenChange={() => setSelectedEventWithAttendance(null)}
        >
          <DialogContent>
            {selectedEventWithAttendance && (
              <FileUploadAndGallery event={selectedEventWithAttendance} />
            )}
          </DialogContent>
        </Dialog>
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
