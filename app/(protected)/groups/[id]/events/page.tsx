import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function GroupEventsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch group details
  const { data: group, error: groupError } = await supabase
    .from("group")
    .select("*")
    .eq("group_id", params.id)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // Fetch events for the group
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/events?groupId=${params.id}`,
    { cache: "no-store" }
  );
  const events = await res.json();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Events for {group.name}</h1>
      <Link
        href={`/circles/${params.id}`}
        className="text-blue-500 hover:underline mb-4 inline-block"
      >
        Back to Group
      </Link>
      {events.length === 0 ? (
        <p>No events scheduled for this group.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event: any) => (
            <li key={event.event_id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{event.name}</h2>
              <p>
                Start: {new Date(event.start_timestamp).toLocaleString()}
              </p>
              <p>
                End: {new Date(event.end_timestamp).toLocaleString()}
              </p>
              <h3 className="mt-2 font-semibold">Attendees:</h3>
              <ul>
                {event.event_person_attendance.map((attendance: any) => (
                  <li key={attendance.person.person_id}>
                    {attendance.person.full_name} ({attendance.person.email})
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}