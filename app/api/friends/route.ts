import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Fetch the user's friends
export async function GET(req: Request) {
  const supabase = createClient();
  const url = new URL(req.url);
  const personId = url.searchParams.get("personId");

  if (!personId) {
    return NextResponse.json(
      { error: "Person ID is required" },
      { status: 400 }
    );
  }

  // Fetch the user's list of friend IDs
  const { data: person, error: personError } = await supabase
    .from("person")
    .select("friends")
    .eq("person_id", personId)
    .single();

  if (personError || !person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  const friendIds = person.friends || [];

  // Fetch full details of the friends based on their IDs
  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*") // Fetch all columns for each friend
    .in("person_id", friendIds);

  if (friendsError) {
    return NextResponse.json({ error: friendsError.message }, { status: 500 });
  }

  // Return full details of the user's friends
  return NextResponse.json(friends, { status: 200 });
}

// Add a friend (POST)
export async function POST(req: Request) {
  const supabase = createClient();
  const { personId, newFriendId } = await req.json();

  // Fetch the current person's friends list
  const { data: person, error: personError } = await supabase
    .from("person")
    .select("friends")
    .eq("person_id", personId)
    .single();

  if (personError || !person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  const currentFriends = person.friends || [];

  // Check if the friend is already in the list
  if (currentFriends.includes(newFriendId)) {
    return NextResponse.json(
      { error: "This person is already your friend" },
      { status: 400 }
    );
  }

  // Add the new friend to the list
  const updatedFriends = [...currentFriends, newFriendId];

  // Update the user's friends list in the database
  const { error: updateError } = await supabase
    .from("person")
    .update({ friends: updatedFriends })
    .eq("person_id", personId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fetch the full updated list of friends
  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*")
    .in("person_id", updatedFriends);

  if (friendsError) {
    return NextResponse.json({ error: friendsError.message }, { status: 500 });
  }

  // Return the updated friends list
  return NextResponse.json(
    { success: true, updatedFriends: friends },
    { status: 200 }
  );
}

// Remove a friend (DELETE)
export async function DELETE(req: Request) {
  const supabase = createClient();
  const { personId, removeFriendId } = await req.json();

  // Fetch the person's current friends list
  const { data: person, error: personError } = await supabase
    .from("person")
    .select("friends")
    .eq("person_id", personId)
    .single();

  if (personError || !person) {
    return NextResponse.json({ error: "Person not found" }, { status: 404 });
  }

  const currentFriends = person.friends || [];

  // Remove the friend's ID from the friends array
  const updatedFriends = currentFriends.filter(
    (id: string) => id !== removeFriendId
  );

  // Update the user's friends list in the database
  const { error: updateError } = await supabase
    .from("person")
    .update({ friends: updatedFriends })
    .eq("person_id", personId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fetch the updated list of friends with full details
  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*")
    .in("person_id", updatedFriends);

  if (friendsError) {
    return NextResponse.json({ error: friendsError.message }, { status: 500 });
  }

  // Return the updated friends list
  return NextResponse.json(
    { success: true, updatedFriends: friends },
    { status: 200 }
  );
}

// Update the friends list (PUT)
export async function PUT(req: Request) {
  const supabase = createClient();
  const { personId, newFriendsList } = await req.json();

  // Update the friends list in the database
  const { error: updateError } = await supabase
    .from("person")
    .update({ friends: newFriendsList })
    .eq("person_id", personId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fetch the full updated list of friends
  const { data: friends, error: friendsError } = await supabase
    .from("person")
    .select("*")
    .in("person_id", newFriendsList);

  if (friendsError) {
    return NextResponse.json({ error: friendsError.message }, { status: 500 });
  }

  // Return the updated friends list
  return NextResponse.json(
    { success: true, updatedFriends: friends },
    { status: 200 }
  );
}
