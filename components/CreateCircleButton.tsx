"use client";

import { useState } from "react";
import CreateCircleModal from "./CreateCircleModal";

export default function CreateCircleButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateCircle = (circleName: string, inviteEmails: string[]) => {
    // Implement the logic to create a circle and send invites
    console.log("Creating circle:", circleName);
    console.log("Inviting:", inviteEmails);
    // You would typically make an API call here to create the circle and send invites
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Create Circle
      </button>
      <CreateCircleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCircle}
      />
    </>
  );
}
