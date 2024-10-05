import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import HoverCard from "@/components/HoverCard"; // Adjust the import path as necessary

export default async function Home({ user }: { user: any }) {
  return (
    <div className="flex w-[1222px] h-[881px] flex-col items-start gap-[72px] shrink-0">
      <div className="flex flex-col items-start gap-6 self-stretch">
        <div className="w-full flex flex-col items-start gap-6">
          <div className="flex p-2.5 justify-center items-center gap-2.5">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Upcoming Events
            </div>
            {/* <div className="flex items-start gap-9 self-stretch"></div> */}
          </div>
          <div className="flex items-start gap-3 self-stretch">
            <div className="flex h-[313px] items-start gap-3 self-stretch">
              <HoverCard>
                {/* Content for the first card */}
                <h3 className="font-bold">Card Title 1</h3>
                <p>Some description for card 1.</p>
              </HoverCard>
              <HoverCard>
                {/* Content for the first card */}
                <h3 className="font-bold">Card Title 1</h3>
                <p>Some description for card 1.</p>
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
