import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import HoverCard from "@/components/HoverCard";
import PersonCard from "@/components/PersonCard";
import CirclesCard from "@/components/CirclesCard";

export default async function Home({ user }: { user: any }) {
  return (
    <div className="flex w-[1222px] h-[881px] flex-col items-start gap-[72px] shrink-0">
      <div className="flex flex-col items-start gap-[24px] self-stretch">
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
      </div>
      <div className="flex w-[1222px] items-start gap-9">
        <div className="flex h-[291px] flex-col items-start gap-6 flex-[1_0_0]">
          <div className="flex items-start gap-6">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Your Circles
            </div>
          </div>
          <div className="flex flex-col items-start gap-2.5 flex-[1_0_0] self-stretch">
            <div className="flex flex-col items-start gap-[12px] flex-[1_0_0] self-stretch">
              <div className="flex items-start gap-[8px] flex-[1_0_0] self-stretch">
                <CirclesCard>
                  {/* Content for the first card */}
                  <h3 className="font-bold">Card Title 1</h3>
                  <p>Some description for card 1.</p>
                </CirclesCard>
                <CirclesCard>
                  {/* Content for the first card */}
                  <h3 className="font-bold">Card Title 1</h3>
                  <p>Some description for card 1.</p>
                </CirclesCard>
                <CirclesCard>
                  {/* Content for the first card */}
                  <h3 className="font-bold">Card Title 1</h3>
                  <p>Some description for card 1.</p>
                </CirclesCard>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="flex flex-col items-start gap-[24px] flex-1"> */}
        <div className="flex flex-col items-start gap-6 flex-[1_0_0]">
          <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
            Your Friends
          </div>
          <div className="flex flex-col items-start gap-[8px] self-stretch">
            <PersonCard>
              {/* Content for the first card */}
              <h3 className="font-bold">Card Title 1</h3>
              <p>Some description for card 1.</p>
            </PersonCard>
            <PersonCard>
              {/* Content for the first card */}
              <h3 className="font-bold">Card Title 1</h3>
              <p>Some description for card 1.</p>
            </PersonCard>
          </div>
        </div>
        {/* </div> */}
      </div>
    </div>
  );
}
