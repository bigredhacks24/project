"use client";

import { useState } from "react";
import type { Person } from "@/types/general-types";
import CreateCircleModal from "./CreateCircleModal";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";

export default function CreateCircleButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateCircle = (circleName: string, invitedPeople: Person[]) => {
    // Implement the logic to create a circle and send invites
    console.log("Creating circle:", circleName);
    console.log("Inviting:", invitedPeople);
    // You would typically make an API call here to create the circle and send invites
  };

  return (
    <div className="-mt-2">
      <Button onClick={() => setIsModalOpen(true)}>
        Create Circle
      </Button>
      <CreateCircleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCircle}
      />
    </div>
  );
}
