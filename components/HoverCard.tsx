import React from 'react';

const HoverCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-start gap-6 flex-1 self-stretch">
      <div className="flex flex-col p-4 gap-4 flex-1 self-stretch border border-[#E4E4E7] bg-white rounded-md shadow-md hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start gap-4 flex-1 self-stretch">
          <div className="flex flex-col justify-center items-start gap-4 flex-1 self-stretch">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoverCard;