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

  const { data: groups, error: groupsError } = await supabase.from("group")
    .select(`
      *,
      event_count:event(count)
    `);

  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*")
    .neq("person_id", user.id);

  if (eventsError || groupsError || friendsError) {
    return <div>Error loading data. Please try again later.</div>;
  }

  const transformedGroups = groups.reduce((acc: any[], group: any) => {
    if (!acc.some((g) => g.group_id === group.group_id)) {
      acc.push({
        ...group,
        event_count: group.event_count[0] || { count: 0 },
      });
    }
    return acc;
  }, []);

  const transformedEvents = events.map((event) => ({
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
  }));

  return (
    <HomeClient
      events={transformedEvents}
      friends={friends}
      groups={transformedGroups}
    />
  );
}

// import { createClient } from "@/utils/supabase/server";
// import HomeClient from "./HomeClient";

// export default async function Home() {
//   const supabase = createClient();

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (!user) {
//     return <div>Please log in to view this page.</div>;
//   }

//   const { data: events, error: eventsError } = await supabase
//     .from("event")
//     .select(`*, event_person_attendance (attending)`)
//     .eq("event_person_attendance.person_id", user.id);

//   const { data: friends, error: friendsError } = await supabase
//     .from("person")
//     .select("*")
//     .neq("person_id", user.id);

//   const { data: groups, error: groupsError } = await supabase
//     .from("group")
//     .select("*");

//   if (eventsError || friendsError || groupsError) {
//     return <div>Error loading data. Please try again later.</div>;
//   }

//   return <HomeClient events={events} friends={friends} groups={groups} />;
// }
