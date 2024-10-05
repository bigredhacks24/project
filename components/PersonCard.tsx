import React from "react";

const PersonCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-[70px] p-[17px] items-start gap-[16px] self-stretch rounded-[6px] border border-[#E4E4E7] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.10),0_2px_4px_-2px_rgba(0,0,0,0.10)]">
      <div className="flex items-center gap-[16px] flex-[1_0_0]">
        <div className="w-9 h-9 rounded-[48px] bg-[#9C9C9C]"></div>
        <div className="flex justify-between items-center flex-[1_0_0]">
          <div className="flex items-start h-[20px]">
            <div className="flex justify-center items-center gap-2.5">
              <div className="text-[#09090B] font-inter text-sm font-normal leading-[1.2]">
                <p>Jasmine Li</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex flex-col items-start">
              <div className="text-[#71717A] font-inter text-xs font-normal leading-[1.2]">
                <p>Two shared events</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
