import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = createClient();

  // Assuming you still want to fetch a user profile by a static ID for now
  const userId = "351e2b84-1c26-4079-9cd7-2a300ce56684"; // Replace with a static UUID for demonstration

  const { data: person, error } = await supabase
    .from("person")
    .select("full_name, phone_number")
    .eq("person_id", userId)
    .single();

  if (error || !person) {
    return redirect("/not-found");
  }

  return (
    <div className="flex flex-col items-center">
      <img
        src="https://picsum.photos/200/300
"
        alt="Profile Photo"
        className="rounded-full w-32 h-32 mb-4"
      />
      <h1 className="text-2xl font-bold">{person.full_name}</h1>
      <p className="text-lg">{person.phone_number}</p>
    </div>
  );
}
