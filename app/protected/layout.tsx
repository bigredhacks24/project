// app/protected/layout.tsx
import { createClient } from "@/utils/supabase/server"; // Using the same client system
import { redirect } from "next/navigation";
import React from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient(); // Initialize the Supabase client

  const {
    data: { user },
  } = await supabase.auth.getUser(); // Check if the user is authenticated

  // If no user is found, redirect to the sign-in page
  if (!user) {
    return redirect("/auth-pages/sign-in");
  }

  // Pass the user data to the children (protected pages)
  return (
    <div>
      {React.cloneElement(children as React.ReactElement<any>, { user })}
    </div>
  );
}
