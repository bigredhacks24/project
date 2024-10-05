import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Fetch all events for a specific user (GET)
export async function GET(req: Request) {
  const supabase = createClient();
  const url = new URL(req.url);
  const personId = url.searchParams.get("personId");

  if (!personId) {
    return NextResponse.json(
      { error: "personId is required" },
      { status: 400 }
    );
  }


  const { data: events, error } = await supabase
    .from("event_person_attendance")
    .select(
      `
        event: event_id (
          *,
          group: group_id (*)
        ),
        attending
      `
    )
    .eq("person_id", personId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(events, { status: 200 });
}

// Create a new event and add all group members to event_person_attendance
export async function POST(req: Request) {
  const supabase = createClient();
  const { groupId, name, start_timestamp, end_timestamp } = await req.json();

  // Fetch all members of the group (group_person table)
  const { data: groupMembers, error: groupMembersError } = await supabase
    .from("group_person")
    .select("person_id")
    .eq("group_id", groupId);

  if (groupMembersError) {
    return NextResponse.json(
      { error: groupMembersError.message },
      { status: 500 }
    );
  }

  if (!groupMembers || groupMembers.length === 0) {
    return NextResponse.json(
      { error: "No members found in the group" },
      { status: 400 }
    );
  }

  // Insert the new event into the 'event' table
  const { data: newEvent, error: eventError } = await supabase
    .from("event")
    .insert([
      {
        group_id: groupId,
        name: name,
        start_timestamp: start_timestamp,
        end_timestamp: end_timestamp,
        creation_timestamp: new Date().toISOString(),
      },
    ])
    .select("*")
    .single();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  // Prepare the entries for the 'event_person_attendance' table (adding all group members as attendees)
  const attendanceEntries = groupMembers.map(
    (member: { person_id: string }) => ({
      event_id: newEvent.event_id,
      person_id: member.person_id,
      attending: true, // Automatically mark them as attending by default
    })
  );

  // Insert attendance records for all group members
  const { error: attendanceError } = await supabase
    .from("event_person_attendance")
    .insert(attendanceEntries);

  if (attendanceError) {
    return NextResponse.json(
      { error: attendanceError.message },
      { status: 500 }
    );
  }

  // Return success with the created event details
  return NextResponse.json({ success: true, event: newEvent }, { status: 201 });
}

// -----------------

// Update an existing event (PUT)
export async function PUT(req: Request) {
  const supabase = createClient();
  const { eventId, name, start_timestamp, end_timestamp } = await req.json();

  // Update the event in the 'event' table
  const { data: updatedEvent, error: eventError } = await supabase
    .from("event")
    .update({
      name: name,
      start_timestamp: start_timestamp,
      end_timestamp: end_timestamp,
    })
    .eq("event_id", eventId)
    .select("*")
    .single();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  return NextResponse.json(
    { success: true, event: updatedEvent },
    { status: 200 }
  );
}

// Delete an event (DELETE)
export async function DELETE(req: Request) {
  const supabase = createClient();
  const { eventId } = await req.json();

  // Delete related entries in the 'event_person_attendance' table
  const { error: attendanceError } = await supabase
    .from("event_person_attendance")
    .delete()
    .eq("event_id", eventId);

  if (attendanceError) {
    return NextResponse.json(
      { error: attendanceError.message },
      { status: 500 }
    );
  }

  // Delete the event from the 'event' table
  const { error: eventError } = await supabase
    .from("event")
    .delete()
    .eq("event_id", eventId);

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
