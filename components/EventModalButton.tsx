"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface EventModalButtonProps {
  onOpen: () => void;
}

const EventModalButton: React.FC<EventModalButtonProps> = ({ onOpen }) => {
  return (
    <div>
      <Button
        onClick={onOpen}
        className="text-white px-4 py-2 rounded ml-4"
      >
        Create New Event
      </Button>
    </div>
  );
};

export default EventModalButton;
