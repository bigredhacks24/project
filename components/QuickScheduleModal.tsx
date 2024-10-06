import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Group } from "@/types/general-types";

interface QuickScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventData) => void;
  initialData: EventData;
  group: Group;
}

interface EventData {
  name: string;
  inviteCircle: string;
  date: string;
  duration: string;
  startTime: string;
  endTime: string;
}

export default function QuickScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  group,
}: QuickScheduleModalProps) {
  const [eventData, setEventData] = useState<EventData>(initialData);

  useEffect(() => {
    setEventData(initialData);
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEventData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(eventData);
  };

  const isFormValid = () => {
    return (
      eventData.name.trim() !== "" &&
      eventData.date !== "" &&
      eventData.duration !== "" &&
      eventData.startTime !== "" &&
      eventData.endTime !== ""
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Schedule Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Event name</Label>
            <Input
              id="name"
              value={eventData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={eventData.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={eventData.duration}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={eventData.startTime}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={eventData.endTime}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Invite Circle</Label>
            <Input value={group.name} disabled />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-white"
              disabled={!isFormValid()}
            >
              Schedule Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
