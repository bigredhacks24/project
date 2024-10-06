import { createClient } from "@/utils/supabase/server";
import EventCard from "@/components/EventCard";
import PersonCard from "@/components/PersonCard";
import CirclesCard from "@/components/CirclesCard";
import { EventAttendance, Friend, Group } from "@/types/general-types";
import CreateCircleButton from "@/components/CreateCircleButton";
import EventCarousel from "@/components/EventCarousel";
import { Button } from "@/components/ui/button";
import InviteFriendButton from "@/components/InviteFriendButton";

interface EventWithAttendance {
  event_id: string;
  group_id: string | null;
  name: string;
  creation_timestamp: string;
  start_timestamp: string;
  end_timestamp: string;
  event_person_attendance: { attending: boolean | null }[];
}

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User is not logged in.");
    return <div>Please log in to view this page.</div>;
  }

  // Fetch events
  const { data: events, error: eventsError } = await supabase
    .from("event")
    .select(
      `
      *,
      event_person_attendance (
        attending
      )
    `
    )
    .eq("event_person_attendance.person_id", user.id);

  // Fetch friends
  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*")
    .neq("person_id", user.id);

  // Fetch groups
  const { data: groups, error: groupsError } = await supabase
    .from("group")
    .select(`
      *,
      group_person!inner (person_id)
    `)
    .eq("group_person.person_id", user.id);

  if (eventsError || friendsError || groupsError) {
    console.error(
      "Error fetching data:",
      eventsError || friendsError || groupsError
    );
    return <div>Error loading data. Please try again later.</div>;
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
          <EventCarousel events={events} />
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
          <div className="flex items-center justify-between w-full">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Your Friends
            </div>
            <InviteFriendButton />
          </div>
          <div className="flex flex-col items-start gap-[8px] self-stretch">
            {friends &&
              friends.map((friend: Friend) => (
                <PersonCard key={friend.person_id} friend={friend} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
