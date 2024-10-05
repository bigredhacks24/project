"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import HoverCard from "@/components/HoverCard";

export default function ProtectedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user }, error: userError } = await createClient().auth.getUser();
        if (userError) throw userError;
        setUser(user);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !user) {
    return <div>Error: {error || 'User not found'}</div>;
  }

  return (
    <div className="flex w-[1222px] h-[881px] flex-col items-start gap-[72px] shrink-0">
      <div className="flex flex-col items-start gap-6 self-stretch">
        <div className="flex flex-col items-start gap-6 w-full">
          <div className="flex p-2.5 justify-center items-center gap-2.5">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Upcoming Events
            </div>
          </div>
          <div className="flex items-start gap-3 self-stretch">
            <div className="flex h-[313px] items-start gap-3 self-stretch">
              <HoverCard>
                <h3 className="font-bold">Card Title 1</h3>
                <p>Some description for card 1.</p>
              </HoverCard>
              <HoverCard>
                <h3 className="font-bold">Card Title 2</h3>
                <p>Some description for card 2.</p>
              </HoverCard>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 self-stretch">
          <div className="flex flex-col items-start gap-6 flex-1">
            <div className="flex items-start gap-6">
              <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
                Your Circles
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 self-stretch"></div>
          </div>
          <div className="flex flex-col items-start gap-6 flex-1">
            <div className="flex items-start gap-6">
              <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
                Your Friends
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
