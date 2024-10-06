import React, { useState } from "react";
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

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: any;
}

export default function PlanModal({
  isOpen,
  onClose,
  eventData,
}: PlanModalProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activity, setActivity] = useState("");
  const [description, setDescription] = useState("");
  const [guestsPlusOne, setGuestsPlusOne] = useState(false);

  // Mock data for common availability
  const [commonAvailability, setCommonAvailability] = useState<
    { start: Date; end: Date }[]
  >([
    { start: new Date(2024, 9, 8, 10, 0), end: new Date(2024, 9, 8, 12, 0) },
    { start: new Date(2024, 9, 9, 14, 0), end: new Date(2024, 9, 9, 16, 0) },
    { start: new Date(2024, 9, 11, 9, 0), end: new Date(2024, 9, 11, 11, 0) },
    { start: new Date(2024, 9, 12, 13, 0), end: new Date(2024, 9, 12, 15, 0) },
    { start: new Date(2024, 9, 14, 15, 0), end: new Date(2024, 9, 14, 18, 0) },
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <div className="flex">
          <div className="flex-1 p-6">
            <DialogHeader>
              <DialogTitle className="text-sm font-normal text-gray-500 mb-1">
                PLAN EVENT
              </DialogTitle>
              <h2 className="text-2xl font-semibold mb-4">New Event</h2>
              <p className="text-sm text-gray-500">
                Choose based on your availabilities and recommendations.
              </p>
            </DialogHeader>
            <form className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pick a date
                </label>
                <Select onValueChange={setDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>{/* Add date options */}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pick a time
                </label>
                <div className="flex space-x-2">
                  <Select onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>{/* Add time options */}</SelectContent>
                  </Select>
                  <Select onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>{/* Add time options */}</SelectContent>
                  </Select>
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
                <Button variant="outline" onClick={onClose}>
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
