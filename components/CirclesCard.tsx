"use client";

import React from "react";
import { Group } from "@/types/general-types";
import { useRouter } from "next/navigation";

interface CirclesCardProps {
  group: Group;
  eventCount: number;
}

export default function CirclesCard({ group, eventCount }: CirclesCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/circles/${group.group_id}`);
  };

  const renderMemberNames = () => {
    const memberCount = group.members.length;
    if (memberCount === 0) return "No members";

    const displayedMembers = group.members.slice(0, 3).map(member => member.full_name.split(' ')[0]);

    if (memberCount <= 3) {
      return displayedMembers.join(", ");
    } else {
      const othersCount = memberCount - 3;
      const othersSuffix = othersCount === 1 ? "other" : "others";
      return `${displayedMembers.join(", ")} and ${othersCount} ${othersSuffix}`;
    }
  };

  return (
    <div
      className="flex w-[195.667px] p-[17px] flex-col items-center gap-[12px] self-stretch rounded-[6px] border border-[#E4E4E7] opacity-80 bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)] cursor-pointer hover:shadow-lg transition-shadow duration-300"
      onClick={handleClick}
    >
      <div className="w-[122px] h-[122px] rounded-[144px] bg-[#364AE8]"></div>
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex h-5 justify-center items-center">
          <div className="flex justify-center items-center gap-2.5">
            <div className="text-[#09090B] font-inter text-sm font-semibold leading-[1.2]">
              <p>{group.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-start max-h-[40px] overflow-y-auto">
          <div className="flex flex-col justify-center items-center">
            <div className="text-[#9C9C9C] font-inter text-xs font-normal leading-[1.2] text-center">
              {renderMemberNames()}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-1">
          <div className="flex flex-col items-start">
            <div className="text-[#71717A] font-inter text-xs font-normal leading-[1.2]">
              <p>{eventCount} events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
