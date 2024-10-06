import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/email"; // You'll need to create this utility function

// Fetch all groups user is part of or a specific group
export async function GET(req: Request) {
  const supabase = createClient();
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const groupId = url.searchParams.get("groupId");

  let query = supabase.from("group_person").select(
    `
      group:group_id(*), 
      person:person_id(full_name, email, person_id) // Ensure person_id is included
    `
  );

  if (groupId) {
    query = query.eq("group_id", groupId);
  } else if (userId) {
    query = query.eq("person_id", userId);
  } else {
    return NextResponse.json(
      { error: "Missing userId or groupId" },
      { status: 400 }
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return full group and person details
  return NextResponse.json(data, { status: 200 });
}

/*
User creating a groups
Conditions:
- Anorther group of sample epopele cant exists
- everyone added to group must be frends with user
*/

// User creating a group
export async function POST(req: Request) {
  const supabase = createClient();

  const { userId, groupName, invitedPeople } = await req.json();

  // Create the group
  const { data: newGroup, error: groupError } = await supabase
    .from("group")
    .insert([{ name: groupName }])
    .select("*")
    .single();

  if (groupError) {
    return NextResponse.json({ error: groupError.message }, { status: 500 });
  }

  const groupPersonEntries = [
    { group_id: newGroup.group_id, person_id: userId },
  ];

  for (const person of invitedPeople) {
    if (person.person_id) {
      // Existing person
      groupPersonEntries.push({
        group_id: newGroup.group_id,
        person_id: person.person_id,
      });
    } else {
      // New person
      const { data: newPerson, error: newPersonError } = await supabase
        .from("person")
        .insert({
          full_name: person.full_name,
          email: person.email,
          person_id: crypto.randomUUID(),
        })
        .select("*")
        .single();

      if (newPersonError) {
        console.error("Error creating new person:", newPersonError);
        continue;
      }

      groupPersonEntries.push({
        group_id: newGroup.group_id,
        person_id: newPerson.person_id,
      });

      // Send invitation email
      await sendEmail(
        person.email,
        "Join Circles!",
        "You should join circles!"
      );
    }
  }

  const { error: groupPersonError } = await supabase
    .from("group_person")
    .insert(groupPersonEntries);

  if (groupPersonError) {
    return NextResponse.json(
      { error: groupPersonError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, group: newGroup }, { status: 201 });
}

// -----------------

// Deleting a group (remove a user from a group)
export async function DELETE(req: Request) {
  const supabase = createClient();
  const { groupId, personId } = await req.json();

  // Remove the person from the group
  const { error } = await supabase
    .from("group_person")
    .delete()
    .eq("group_id", groupId)
    .eq("person_id", personId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optional: Check if the group still has any members left, and delete the group if empty
  const { data: groupMembers, error: memberError } = await supabase
    .from("group_person")
    .select("*")
    .eq("group_id", groupId);

  if (!memberError && groupMembers.length === 0) {
    await supabase.from("group").delete().eq("group_id", groupId);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

// Add a person to an existing group
export async function PUT(req: Request) {
  const supabase = createClient();
  const { groupId, userId, newPersonId } = await req.json();

  // Validate that the new person is a friend of the user adding them
  const { data: user, error: userError } = await supabase
    .from("person")
    .select("friends")
    .eq("person_id", userId)
    .single();

  if (
    userError ||
    !user ||
    !user.friends ||
    !user.friends.includes(newPersonId)
  ) {
    return NextResponse.json(
      { error: "New person is not your friend" },
      { status: 400 }
    );
  }

  // Add the new person to the group
  const { error: groupPersonError } = await supabase
    .from("group_person")
    .insert([{ group_id: groupId, person_id: newPersonId }]);

  if (groupPersonError) {
    return NextResponse.json(
      { error: groupPersonError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
