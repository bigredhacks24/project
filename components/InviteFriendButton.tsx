"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InviteFriendModal from "@/components/InviteFriendModal";

const InviteFriendButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Invite Friend</Button>
      <InviteFriendModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default InviteFriendButton;
