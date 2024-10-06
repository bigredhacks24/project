import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // Importing Button for consistent UI

import { Person } from "@/types/general-types";

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (circleName: string, invitedPeople: Person[]) => void;
}

const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [circleName, setCircleName] = useState("");
  const [inviteEmails, setInviteEmails] = useState([""]);
  const [invitedPeople, setInvitedPeople] = useState<Person[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCircleName("");
      setInviteEmails([""]);
      setInvitedPeople([]);
    }
  }, [isOpen]);

  const handleAddEmail = () => {
    setInviteEmails([...inviteEmails, ""]);
  };

  const handleEmailChange = async (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);

    if (value.trim() !== "") {
      const response = await fetch(
        `/api/people?email=${encodeURIComponent(value)}`
      );
      const data = await response.json();

      if (data.person) {
        setInvitedPeople((prev) => [
          ...prev.filter((p) => p.email !== value),
          data.person,
        ]);
      } else {
        setInvitedPeople((prev) => prev.filter((p) => p.email !== value));
      }
    }
  };

  const handleSubmit = () => {
    onCreate(circleName, invitedPeople);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 10000 }}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Create Circle</h2>
        <input
          type="text"
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
          placeholder="Circle Name"
          className="w-full p-2 mb-4 border rounded"
        />
        <h3 className="text-lg font-semibold mb-2">Add Friends</h3>
        {inviteEmails.map((email, index) => (
          <div key={index} className="mb-2">
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              placeholder="Friend's Email"
              className="w-full p-2 border rounded"
            />
            {invitedPeople.find((p) => p.email === email) && (
              <div className="flex items-center mt-1">
                <img
                  src={
                    invitedPeople.find((p) => p.email === email)
                      ?.profile_picture || "https://avatar.iran.liara.run/public"
                  }
                  alt="Profile"
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                <span>
                  {invitedPeople.find((p) => p.email === email)?.full_name}
                </span>
              </div>
            )}
          </div>
        ))}
        <button
          onClick={handleAddEmail}
          className="text-blue-500 underline mb-4"
        >
          + Add another email
        </button>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <Button onClick={handleSubmit}>Create Circle</Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCircleModal;
