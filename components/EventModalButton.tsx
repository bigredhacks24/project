"use client";

import React, { useState } from "react";
import EventModal from "@/components/EventModal";

interface EventModalButtonProps {
  onOpen: () => void;
}

const EventModalButton: React.FC<EventModalButtonProps> = ({ onOpen }) => {
  //   const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <button
        onClick={onOpen}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create New Event
      </button>
    </div>
  );
};

export default EventModalButton;
