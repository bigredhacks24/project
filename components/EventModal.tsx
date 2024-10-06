import React, { useState } from "react";
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

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: (data: any) => void;
  groups: Group[];
}

export default function EventModal({
  isOpen,
  onClose,
  onNext,
  groups,
}: EventModalProps) {
  const [eventData, setEventData] = useState({
    name: "",
    inviteCircle: "",
    date: "",
    duration: "",
    startTime: "",
    endTime: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEventData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setEventData((prev) => ({ ...prev, inviteCircle: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(eventData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden">
        <div className="flex">
          <div className="flex-1 p-6">
            <DialogHeader>
              <DialogTitle className="text-sm font-normal text-gray-500 mb-1">
                CREATE NEW EVENT
              </DialogTitle>
              <h2 className="text-2xl font-semibold mb-4">New Event</h2>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Input
                  id="name"
                  placeholder="Event name"
                  value={eventData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invite">Who do you want to invite?</Label>
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger id="invite">
                    <SelectValue placeholder="Select friend circles" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.group_id} value={group.group_id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Earliest date of event</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventData.date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">
                  Minimum duration for common availability
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="45"
                  value={eventData.duration}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Earliest start time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={eventData.startTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">Latest end time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={eventData.endTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex justify-start space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-black text-white">
                  Next
                </Button>
              </div>
            </form>
          </div>
          <div className="w-[400px] h-[400px] ml-[50px] mr-[70px] flex items-center justify-center self-center">
            <img
              src="https://www.liftforfoxsakes.com/wp-content/uploads/2016/03/placeholder-300x300.jpg"
              alt="Event"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
