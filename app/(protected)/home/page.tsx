'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import PersonCard from "@/components/PersonCard";
import CirclesCard from "@/components/CirclesCard";
import { Friend, Group } from "@/types/general-types";
import CreateCircleButton from "@/components/CreateCircleButton";
import EventCarousel from "@/components/EventCarousel";
import FileUploadAndGallery from "@/components/FileUploadAndGallery";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Spinner from '@/components/Spinner';
import type { EventWithAttendance } from '@/types/general-types';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<EventWithAttendance[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedEventWithAttendance, setselectedEventWithAttendance] = useState<EventWithAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);

        if (user) {
          // Fetch events
          const { data: eventsData, error: eventsError } = await supabase
            .from("event")
            .select(`
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
            `)
            .eq("event_person_attendance.person_id", user.id)
            .gte('start_timestamp', new Date().toISOString())
            .order('start_timestamp', { ascending: true });
          if (eventsError) throw eventsError;
          setEvents(eventsData.map((event) => ({
            ...event,
            event_person_attendance: event.event_person_attendance.map((attendance) => ({
              attending: attendance.attending ?? false,
              person: {
                person_id: attendance.person?.person_id || "",
                email: attendance.person?.email || "",
                full_name: attendance.person?.full_name || "",
                friends: attendance.person?.friends || [],
                phone_number: attendance.person?.phone_number || "",
                profile_picture: attendance.person?.profile_picture || "",
                refresh_token: attendance.person?.refresh_token || "",
              }
            }))
          })));

          // Fetch groups
          const { data: groupsData, error: groupsError } = await supabase
            .from("group")
            .select(`
              *,
              event_count:event(count)
            `);
          if (groupsError) throw groupsError;

          const transformedGroups = groupsData.map((group: any) => ({
            ...group,
            event_count: group.event_count[0] || { count: 0 }
          }));

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
    setselectedEventWithAttendance(event);
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
    <div className="flex w-[1222px] h-[881px] flex-col items-start gap-[72px] shrink-0">
      <div className="flex flex-col items-start gap-[24px] self-stretch">
        <div className="w-full flex flex-col items-start gap-6">
          <div className="flex p-2.5 justify-center items-center gap-2.5">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Upcoming Events
            </div>
          </div>
          <EventCarousel events={events} onEventClick={handleEventClick} />
        </div>
      </div>
      <div className="w-[1222px] items-start gap-9 grid grid-cols-2">
        <div className="flex h-[291px] flex-col items-start gap-6 flex-[1_0_0]">
          <div className="flex items-start gap-6">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Your Circles
            </div>
            <CreateCircleButton />
          </div>
          <div className="flex overflow-x-scroll gap-x-4 w-full">
            {groups &&
              groups.map((group: Group) => (
                <div key={group.group_id}>
                  <CirclesCard
                    group={group}
                    eventCount={group.event_count?.count || 0}
                  />
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-6 flex-[1_0_0]">
          <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
            Your Friends
          </div>
          <div className="flex flex-col items-center gap-[8px] self-stretch justify-center overflow-y-scroll h-[400px] pt-20">
            {friends &&
              friends.map((friend: Friend) => (
                <PersonCard key={friend.person_id} friend={friend} />
              ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedEventWithAttendance} onOpenChange={() => setselectedEventWithAttendance(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Files</DialogTitle>
          </DialogHeader>
          {selectedEventWithAttendance && <FileUploadAndGallery event={selectedEventWithAttendance} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}