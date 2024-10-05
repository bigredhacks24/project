import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Fetch all events for a specific user
export async function GET(req: Request) {
  const supabase = createClient();
  const url = new URL(req.url);
  const personId = url.searchParams.get("personId");

  if (!personId) {
    return NextResponse.json({ error: "Person ID is required" }, { status: 400 });
  }

  // Fetch events for a user by checking the 'event_person_attendance' table
  const { data: events, error } = await supabase
    .from("event")
    .select(
      `
      *,
      event_person_attendance (
        attending
      )
    `
    )
    .eq("event_person_attendance.person_id", personId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the full event data where the user is attending
  return NextResponse.json(events, { status: 200 });
}
