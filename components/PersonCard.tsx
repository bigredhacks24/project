import React from "react";
import { Friend } from "../types/general-types"; // Import the Friend type
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { User } from "lucide-react";

interface PersonCardProps {
  friend: Friend; // Use the Friend type
}

const PersonCard: React.FC<PersonCardProps> = ({ friend }) => {
  return (
    <div className="flex h-[70px] p-[17px] gap-[16px] self-stretch rounded-[6px] border border-[#E4E4E7] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)] items-center">
      {friend.profile_picture ? (
        <div className="w-9 h-9 rounded-[48px] overflow-hidden">
          <img
            src={friend.profile_picture}
            alt={`${friend.full_name}'s profile`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <Avatar className="size-9 bg-[#9C9C9C] rounded-full text-center flex items-center justify-center text-white">
          <AvatarImage src={friend.profile_picture ?? undefined} />
          <AvatarFallback>
            {(friend.full_name ?? "").split(" ").map((name) => name[0]).join("")}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex justify-between items-center flex-[1_0_0]">
        <div className="flex items-start h-[20px]">
          <div className="text-[#09090B] font-inter text-sm font-normal leading-[1.2]">
            <p>{friend.full_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex flex-col items-start">
            <div className="text-[#71717A] font-inter text-xs font-normal leading-[1.2]">
              <p>{friend.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
