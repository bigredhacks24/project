"use client";

import { useState } from "react";
import type { Person } from "@/types/general-types";
import { Button } from "@/components/ui/button"; // Importing Button for consistent UI
import CreateCircleModal from "./CreateCircleModal";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";

export default function CreateCircleButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateCircle = (circleName: string, invitedPeople: Person[]) => {
    console.log("Creating circle:", circleName);
    console.log("Inviting:", invitedPeople);
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