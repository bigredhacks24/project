import { createClient } from "@/utils/supabase/server";
import HomeClient from "./HomeClient";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view this page.</div>;
  }

  const { data: events, error: eventsError } = await supabase
    .from("event")
    .select(`*, event_person_attendance (attending)`)
    .eq("event_person_attendance.person_id", user.id);

  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*")
    .neq("person_id", user.id);

  const { data: groups, error: groupsError } = await supabase
    .from("group")
    .select("*");

  if (eventsError || friendsError || groupsError) {
    return <div>Error loading data. Please try again later.</div>;
  }

  return <HomeClient events={events} friends={friends} groups={groups} />;
}
