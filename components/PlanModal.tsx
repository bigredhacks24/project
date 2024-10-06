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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

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

type SecondDegreeConnection = {
  person_id: string;
  full_name: string;
  email: string;
  profile_picture: string | null;
  connection_count: number;
};

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
  const [isCalculating, setIsCalculating] = useState(false);
  const [suggestedPlusOne, setSuggestedPlusOne] = useState<SecondDegreeConnection | null>(null);
  const [commonAvailability, setCommonAvailability] = useState<{
    [key: string]: { start: Date; end: Date; }[];
  }>({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setDate(eventData.date);
    setStartTime(eventData.startTime);
    setEndTime(eventData.endTime);

    const fetchGroupMembers = async () => {
      const { data: group, error } = await supabase
        .from('group')
        .select(`
          *,
          group_person (*)
        `)
        .eq('group_id', eventData.inviteCircle)
        .single();

      if (error) {
        console.error("Error fetching group data:", error);
        return;
      }

      setGroupMembers(group.group_person || []);
    };

    fetchGroupMembers();
  }, [eventData]);

  useEffect(() => {
    if (groupMembers.length > 0) {
      const fetchFreePeriods = async () => {
        const allFreePeriods: { [key: string]: { start: Date; end: Date; }[]; }[] =
          await Promise.all(
            groupMembers.map(async (member) => {
              const response = await fetch(
                `/api/calendar-data/date?userId=${member.person_id}`
              );
              if (!response.ok) {
                console.error(
                  `Failed to fetch free periods for user ${member.person_id}`
                );
                return {};
              }
              const data = await response.json();
              console.log(
                `Free periods for user ${member.person_id}:`,
                data.freePeriods
              );
              return data.freePeriods;
            })
          );

        // Intersect free periods
        const intersectedFreePeriods: {
          [key: string]: { start: Date; end: Date; }[];
        } = {};
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        days.forEach((day) => {
          const dayFreePeriods = allFreePeriods.map(
            (userPeriods) => userPeriods[day] || []
          );
          intersectedFreePeriods[day] = intersectTimeBlocks(dayFreePeriods);
        });

        return intersectedFreePeriods;
      };

      const intersectTimeBlocks = (
        timeBlocksArrays: { start: Date; end: Date; }[][]
      ) => {
        if (timeBlocksArrays.length === 0) return [];

        let result = timeBlocksArrays[0];
        for (let i = 1; i < timeBlocksArrays.length; i++) {
          result = result
            .flatMap((block1) =>
              timeBlocksArrays[i].map((block2) => ({
                start: new Date(
                  Math.max(
                    new Date(block1.start).getTime(),
                    new Date(block2.start).getTime()
                  )
                ),
                end: new Date(
                  Math.min(
                    new Date(block1.end).getTime(),
                    new Date(block2.end).getTime()
                  )
                ),
              }))
            )
            .filter((block) => block.start < block.end);
        }
        return result;
      };

      const setCommonFreePeriods = async () => {
        const commonFreePeriods = await fetchFreePeriods();
        setCommonAvailability(commonFreePeriods);
        setIsLoadingAvailability(false);
      };

      setCommonFreePeriods();
    }
  }, [groupMembers]);

  const handlePlusOneChange = async (checked: boolean) => {
    setGuestsPlusOne(checked);

    if (checked) {
      setIsCalculating(true);
      try {
        const suggestedPerson = await calculateMostCommonSecondDegreeConnection();
        setSuggestedPlusOne(suggestedPerson);
      } catch (error) {
        console.error("Error calculating suggested plus one:", error);
      } finally {
        setIsCalculating(false);
      }
    } else {
      setSuggestedPlusOne(null);
    }
  };

  const calculateMostCommonSecondDegreeConnection = async (): Promise<SecondDegreeConnection> => {
    const response = await fetch(`/api/second-degree-connections?groupId=${eventData.inviteCircle}`);
    if (!response.ok) {
      throw new Error("Failed to fetch second-degree connections");
    }
    const data = await response.json();
    return data.mostCommonConnection;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let targetGroupId = eventData.inviteCircle;

      // Get * from supabase DB for that group — the circle and any group_people in it.
      const { data: circle, error } = await supabase
        .from('group')
        .select(`
          *,
          group_person (*)
        `)
        .eq('group_id', eventData.inviteCircle)
        .single();

      if (error) {
        console.error("Error fetching circle data:", error);
        return;
      }

      if (guestsPlusOne && suggestedPlusOne) {
        const newGroupName = `${circle.name} + ${suggestedPlusOne.full_name}`;
        const membersWithPlusOne = [...(circle?.group_person ?? []), suggestedPlusOne.person_id];

        const response = await fetch("/api/groups/find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newGroupName, members: membersWithPlusOne }),
        });

        if (!response.ok) {
          throw new Error("Failed to find or create group");
        }

        const { group, created } = await response.json();
        targetGroupId = group.group_id;

        if (created) {
          console.log("New group created:", group);
        } else {
          console.log("Existing group found:", group);
        }
      }

      const newEvent = {
        groupId: targetGroupId,
        name: eventData.name,
        start_timestamp: `${date}T${startTime}:00`,
        end_timestamp: `${date}T${endTime}:00`,
        description,
        allowPlusOne: guestsPlusOne,
      };

      const eventResponse = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEvent),
      });

      if (!eventResponse.ok) {
        throw new Error("Failed to create event");
      }

      // Close the modal
      onClose();

      // Redirect to the new group page if a new group was created
      if (targetGroupId !== eventData.inviteCircle) {
        router.push(`/circles/${targetGroupId}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose activity (based on your shared interests)
                </label>
                <Select onValueChange={setActivity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>Add some activity options...</SelectContent>
                </Select>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  onCheckedChange={(checked) => handlePlusOneChange(checked as boolean)}
                />
                <label
                  htmlFor="guestsPlusOne"
                  className="text-sm font-medium text-gray-700"
                >
                  Find us a new friend!
                </label>
              </div>
              {isCalculating && <Spinner />}
              {suggestedPlusOne && (
                <div className="mt-4 p-4 border rounded">
                  <h4 className="text-lg font-medium mb-2">Suggested Plus One</h4>
                  <div className="flex items-center">
                    <img
                      src={suggestedPlusOne.profile_picture || "https://avatar.iran.liara.run/public"}
                      alt={suggestedPlusOne.full_name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{suggestedPlusOne.full_name}</p>
                      <p className="text-sm text-gray-500">{suggestedPlusOne.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-start space-x-3">
                <Button variant="outline" onClick={onBack}>
                  Back
                </Button>
                <Button type="submit" className="bg-black text-white">
                  {guestsPlusOne ? "Create Event with Plus One" : "Send invite"}
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
              {isLoadingAvailability ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Spinner />
                </div>
              ) : (
                <WeeklyCalendar
                  startDate={new Date()}
                  commonAvailability={commonAvailability}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}