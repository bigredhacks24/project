import React, { useState } from "react";

interface CreateCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (circleName: string, inviteEmails: string[]) => void;
}

const CreateCircleModal: React.FC<CreateCircleModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [circleName, setCircleName] = useState("");
  const [inviteEmails, setInviteEmails] = useState([""]);

  const handleAddEmail = () => {
    setInviteEmails([...inviteEmails, ""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  const handleSubmit = () => {
    onCreate(
      circleName,
      inviteEmails.filter((email) => email.trim() !== "")
    );
    setCircleName("");
    setInviteEmails([""]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Create Circle</h2>
        <input
          type="text"
          value={circleName}
          onChange={(e) => setCircleName(e.target.value)}
          placeholder="Circle Name"
          className="w-full p-2 mb-4 border rounded"
        />
        <h3 className="text-lg font-semibold mb-2">Invite Friends</h3>
        {inviteEmails.map((email, index) => (
          <input
            key={index}
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(index, e.target.value)}
            placeholder="Friend's Email"
            className="w-full p-2 mb-2 border rounded"
          />
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
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Circle
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCircleModal;
