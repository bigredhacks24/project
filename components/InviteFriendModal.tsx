"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendEmail } from "@/utils/email";

interface InviteFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteFriendModal: React.FC<InviteFriendModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the email is associated with a current user
    const response = await fetch(`/api/people?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (!data.person) {
      // If the email is not associated with a current user, send an invitation email
      await sendEmail(email, "Join our app!", "You've been invited to join our app!");
      alert("Invitation sent!");
    } else {
      alert("This user is already registered.");
    }

    setEmail("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4 text-black">Invite a Friend</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Friend's Email"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="mr-2"
            >
              Cancel
            </Button>
            <Button type="submit">Send Invite</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteFriendModal;