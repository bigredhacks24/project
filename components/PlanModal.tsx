import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import WeeklyCalendar from "@/components/WeeklyCalendar";

interface EventData {
  name: string;
  inviteCircle: string;
  date: string;
  duration: string;
  startTime: string;
  endTime: string;
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  eventData: EventData;
}

export default function PlanModal({
  isOpen,
  onClose,
  onBack,
  eventData,
}: PlanModalProps) {
  const [date, setDate] = useState(eventData.date);
  const [startTime, setStartTime] = useState(eventData.startTime);
  const [endTime, setEndTime] = useState(eventData.endTime);
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [guestsPlusOne, setGuestsPlusOne] = useState(false);

  useEffect(() => {
    setDate(eventData.date);
    setStartTime(eventData.startTime);
    setEndTime(eventData.endTime);
  }, [eventData]);

  const [commonAvailability, setCommonAvailability] = useState<{ [key: string]: { start: Date; end: Date }[] }>({
    Sunday: [
      { start: new Date(2024, 9, 8, 10, 0), end: new Date(2024, 9, 8, 12, 0) },
    ],
    Monday: [
      { start: new Date(2024, 9, 9, 14, 0), end: new Date(2024, 9, 9, 16, 0) },
    ],
    Wednesday: [
      { start: new Date(2024, 9, 11, 9, 0), end: new Date(2024, 9, 11, 11, 0) },
    ],
    Thursday: [
      { start: new Date(2024, 9, 12, 13, 0), end: new Date(2024, 9, 12, 15, 0) },
    ],
    Saturday: [
      { start: new Date(2024, 9, 14, 15, 0), end: new Date(2024, 9, 14, 18, 0) },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent = {
      groupId: eventData.inviteCircle,
      name: eventData.name,
      start_timestamp: `${date}T${startTime}:00`,
      end_timestamp: `${date}T${endTime}:00`,
      description,
      allowPlusOne: guestsPlusOne,
    };

    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    });

    if (response.ok) {
      // Handle success (e.g., close modal, show success message)
      onClose();
    } else {
      // Handle error (e.g., show error message)
      console.error("Failed to create event");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <div className="flex">
          <div className="flex-1 p-6">
            <DialogHeader>
              <DialogTitle className="text-sm font-normal text-gray-500 mb-1">
                PLAN EVENT
              </DialogTitle>
              <h2 className="text-2xl font-semibold mb-4">{eventData.name}</h2>
              <p className="text-sm text-gray-500">
                Choose based on your availabilities and recommendations.
              </p>
            </DialogHeader>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Choose activity (based on your shared interests)
                </label>
                <Select onValueChange={setActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>{/* Add activity options */}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Description
                </label>
                <Textarea
                  placeholder="Add description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="guestsPlusOne"
                  checked={guestsPlusOne}
                  onCheckedChange={(checked) =>
                    setGuestsPlusOne(checked as boolean)
                  }
                />
                <label
                  htmlFor="guestsPlusOne"
                  className="text-sm font-medium text-gray-700"
                >
                  Guests can bring a plus one
                </label>
              </div>
              <div className="flex justify-start space-x-3">
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button type="submit" className="bg-black text-white">
                  Send invite
                </Button>
              </div>
            </form>
          </div>
          <div className="flex-1 bg-gray-100 p-6">
            <div className="lg:mt-[0.85rem]">
              <h2 className="text-base font-semibold mb-2 uppercase">
                Availability Notifications
              </h2>
              <div className="mb-6 flex justify-between items-center">
                <p className="font-light text-base">
                  Email weekly with common availabilities for the next week
                </p>
                <Button variant="link" className="p-0 h-auto text-[#B5B5B5]">
                  Edit
                </Button>
              </div>

              <h2 className="text-base font-semibold mb-2 uppercase">
                Common Availability
              </h2>
              <WeeklyCalendar
                startDate={new Date()}
                commonAvailability={commonAvailability}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
