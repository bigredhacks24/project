import { createClient } from "@/utils/supabase/server";
import EventCard from "@/components/EventCard";
import PersonCard from "@/components/PersonCard";
import CirclesCard from "@/components/CirclesCard";
import { EventAttendance, Group, Friend, Event } from "@/types/general-types";

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
  const { data: rawEvents, error: eventsError } = await supabase
    .from("event")
    .select(
      `
      *,
      event_person_attendance (
        attending
      ),
      group (
        group_id,
        name
      )
    `
    )
    .eq("event_person_attendance.person_id", user.id);

  // Transform raw events into EventAttendance type
  const events: EventAttendance[] =
    rawEvents?.map((rawEvent: any) => ({
      event: {
        event_id: rawEvent.event_id,
        group_id: rawEvent.group_id,
        name: rawEvent.name,
        creation_timestamp: rawEvent.creation_timestamp,
        start_timestamp: rawEvent.start_timestamp,
        end_timestamp: rawEvent.end_timestamp,
      },
      group: rawEvent.group,
      attending: rawEvent.event_person_attendance[0]?.attending ?? false,
    })) || [];

  // Fetch friends
  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*")
    .neq("person_id", user.id);

  // Fetch groups
  const { data: groups, error: groupsError } = await supabase
    .from("group")
    .select("*");

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
          <div className="flex items-start gap-3 self-stretch">
            <div className="flex h-[313px] items-start gap-3 self-stretch">
              {events.map((eventAttendance: EventAttendance) => (
                <EventCard
                  key={eventAttendance.event.event_id}
                  eventAttendance={eventAttendance}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-[1222px] items-start gap-9">
        <div className="flex h-[291px] flex-col items-start gap-6 flex-[1_0_0]">
          <div className="flex items-start gap-6">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Your Circles
            </div>
          </div>
          <div className="flex flex-col items-start gap-2.5 flex-[1_0_0] self-stretch">
            <div className="flex flex-col items-start gap-[12px] flex-[1_0_0] self-stretch">
              <div className="flex items-start gap-[8px] flex-[1_0_0] self-stretch">
                {groups &&
                  groups.map((group: Group) => (
                    <CirclesCard
                      key={group.group_id}
                      group={group}
                      eventCount={0} // You might want to calculate this based on events data
                    />
                  ))}
              </div>
            </div>
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
    </div>
  );
}
