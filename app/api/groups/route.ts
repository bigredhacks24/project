// app/api/groups.ts

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Fetch all groups user is part of
export async function GET(req: Request) {
  const supabase = createClient();
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  const { data, error } = await supabase
    .from("group_person")
    .select(
      `
      group:group_id(*), 
      person:person_id(full_name, email)
    `
    )
    .eq("person_id", !userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return full group and person details
  return NextResponse.json(data, { status: 200 });
}

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

/*
User creating a groups
Conditions:
- Anorther group of sample epopele cant exists
- everyone added to group must be frends with user
*/

// User creating a group
export async function POST(req: Request) {
  const supabase = createClient();

  const { userId, groupName, personIds } = await req.json();

  // Fetch the list of friends for the user creating the group
  const { data: user, error: userError } = await supabase
    .from("person")
    .select("friends")
    .eq("person_id", userId)
    .single();

  if (userError || !user) {
    return NextResponse.json(
      { error: "User not found or unable to fetch friends" },
      { status: 400 }
    );
  }

  // Validate that all members are friends of the user
  const invalidFriends = personIds.filter(
    (id: string) => user.friends && !user.friends.includes(id)
  );

  if (invalidFriends.length > 0) {
    return NextResponse.json(
      { error: "Some people are not your friends" },
      { status: 400 }
    );
  }

  // Create the group
  const { data: newGroup, error: groupError } = await supabase
    .from("group")
    .insert([{ name: groupName }])
    .select("*")
    .single();

  if (groupError) {
    return NextResponse.json({ error: groupError.message }, { status: 500 });
  }

  // Insert group members
  const groupPersonEntries = personIds.map((personId: string) => ({
    group_id: newGroup.group_id,
    person_id: personId,
  }));

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
