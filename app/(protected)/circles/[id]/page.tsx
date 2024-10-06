"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Database } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { sendEmail } from "@/utils/email";
// import mailgun from 'mailgun-js';
// import mailcomposer from "mailcomposer";
type CircleData = Database["public"]["Tables"]["group"]["Row"] & {
  members: Database["public"]["Tables"]["person"]["Row"][];
};

type Event = Database["public"]["Tables"]["event"]["Row"];

type CirclePageData = {
  upcomingEvents: Event[];
  suggestedEvents: Event[];
  pastEvents: Event[];
};

type Recommendation = {
  text: string;
  times: string[];
};

interface AvailabilityBlock {
  start: Date;
  end: Date;
}
export default function CirclePage() {
  const { id } = useParams();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [emailButtonClicked, setEmailButtonClicked] = useState(false);
  const [circle, setCircle] = useState<CircleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageData, setPageData] = useState<CirclePageData>({
    upcomingEvents: [],
    suggestedEvents: [],
    pastEvents: [],
  });
  const [commonAvailability, setCommonAvailability] = useState<{
    [key: string]: { start: Date; end: Date }[];
  }>({});
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    start_time: "",
    end_time: "",
    description: "",
    allowPlusOne: false,
  });

  let lastFetchedID = "";

  useEffect(() => {
        const fetchCircleData = async () => {
        if (lastFetchedID === id) {
            return;
        }
        lastFetchedID = typeof id === 'string' ? id : id[0];
      try {
        const response = await fetch(`/api/groups?groupId=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch circle data");
        }
        const data = await response.json();
        console.log("Raw group data:", data); // Log the raw data

        if (data && data.length > 0) {
          const circleData = {
            ...data[0].group,
            members: data.map((item: any) => item.person),
          };
          console.log("Processed circle data:", circleData); // Log the processed data
          console.log("Circle members:", circleData.members); // Log the members specifically

          setCircle(circleData);

          if (circleData.members && circleData.members.length > 0) {
            // Fetch common free periods
            const commonFreePeriods = await fetchFreePeriods(
              circleData.members
            );
            console.log("Common free periods:", commonFreePeriods);

            setCommonAvailability(commonFreePeriods);
          } else {
            console.warn("No members found for this circle");
          }

          // Fetch events for this circle
          const eventsResponse = await fetch(`/api/events?groupId=${id}`);
          if (!eventsResponse.ok) {
            throw new Error("Failed to fetch events data");
          }
          const eventsData: Event[] = await eventsResponse.json();

          const now = new Date();
          const upcomingEvents = eventsData.filter(
            (event) => new Date(event.start_timestamp) > now
          );
          const pastEvents = eventsData.filter(
            (event) => new Date(event.end_timestamp) <= now
          );

          setPageData({
            upcomingEvents,
            suggestedEvents: [],
            pastEvents,
          });
        } else {
          console.warn("No data returned for this group ID");
        }
      } catch (error) {
        console.error("Error fetching circle data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCircleData();
  }, [id]);
  useEffect(() => {
    if (commonAvailability) {
      const newRecommendations: Recommendation[] = [];

      Object.entries(commonAvailability).forEach(([day, blocks]) => {
        blocks.forEach((block) => {
          const startTime = new Date(block.start);
          const endTime = new Date(block.end);
          const startHour = startTime.getHours();
          const endHour = endTime.getHours();
          const isWeekend = ["Saturday", "Sunday"].includes(day);

          let recommendation = "";

          if (
            startHour >= 17 &&
            startHour <= 19 &&
            endHour >= 17.5 &&
            endHour <= 20
          ) {
            recommendation = "🍽️ Grab dinner?";
          } else if (
            startHour >= 11 &&
            startHour <= 12.5 &&
            endHour >= 11.5 &&
            endHour <= 13.5
          ) {
            recommendation = "Grab lunch?";
          } else if (
            startHour >= 19 &&
            startHour <= 22.5 &&
            endHour >= 21.5 &&
            endHour <= 23.98
          ) {
            recommendation =
              Math.random() < 0.5 ? "Watch a movie?" : "Game night?";
          } else if (
            isWeekend &&
            ((startHour >= 6 && startHour <= 11) ||
              (startHour >= 12 && startHour <= 17))
          ) {
            const weekendActivities = [
              "Play pickleball!",
              "Tennis era?",
              "Cafe crawl?",
              "Lynah rink skating?",
              "Picnic on the slope",
            ];
            recommendation =
              weekendActivities[
                Math.floor(Math.random() * weekendActivities.length)
              ];
          }

          if (recommendation) {
            const timeString = `${day} ${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
            const existingRecommendation = newRecommendations.find(
              (r) => r.text === recommendation
            );
            if (existingRecommendation) {
              existingRecommendation.times.push(timeString);
            } else {
              newRecommendations.push({
                text: recommendation,
                times: [timeString],
              });
            }
          }
        });
      });

      setRecommendations(newRecommendations);
    }
  }, [commonAvailability]);
  const fetchFreePeriods = async (members: any[]) => {
    const allFreePeriods: { [key: string]: { start: Date; end: Date }[] }[] =
      await Promise.all(
        members.map(async (member) => {
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

    console.log("All free periods:", JSON.stringify(allFreePeriods, null, 2));

    // Intersect free periods
    const intersectedFreePeriods: {
      [key: string]: { start: Date; end: Date }[];
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
    timeBlocksArrays: { start: Date; end: Date }[][]
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

  // Add this helper function at the beginning of the component
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { date, start_time, end_time, ...restEventData } = newEvent;
      const start_timestamp = new Date(`${date}T${start_time}`).toISOString();
      const end_timestamp = new Date(`${date}T${end_time}`).toISOString();

      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: id,
          ...restEventData,
          start_timestamp,
          end_timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const { event: createdEvent } = await response.json();

      // Update the state with the new event
      setPageData((prevData) => {
        const now = new Date();
        const isUpcoming = new Date(createdEvent.start_timestamp) > now;

        if (isUpcoming) {
          return {
            ...prevData,
            upcomingEvents: [...prevData.upcomingEvents, createdEvent].sort(
              (a, b) =>
                new Date(a.start_timestamp).getTime() -
                new Date(b.start_timestamp).getTime()
            ),
          };
        } else {
          return {
            ...prevData,
            pastEvents: [...prevData.pastEvents, createdEvent].sort(
              (a, b) =>
                new Date(b.end_timestamp).getTime() -
                new Date(a.end_timestamp).getTime()
            ),
          };
        }
      });

      // Reset form
      setNewEvent({
        name: "",
        date: "",
        start_time: "",
        end_time: "",
        description: "",
        allowPlusOne: false,
      });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleEmailButtonClicked = async () => {
    if (circle && circle.members) {
      const userEmails = circle.members.map((member) => member.email);

      // Generate summary of recommendations
      const recommendationsSummary =
        generateRecommendationsSummary(recommendations);

      const emailContent = `
      Hey ${circle.name}!
  Here are your common times and recommended hangout activities for the next week:\n
  
  ${recommendationsSummary}
  
View more at <a href="https://findcircles.co/group/${circle.group_id}">Circles</a> ✨
      `;

      await sendEmail(
        // userEmails.join(", "),
        "jasminexinzeli@gmail.com",
        `🟡 Hangout times with ${circle.name} this week!`,
        emailContent
      );
      setEmailButtonClicked(true);
    }
  };

  const generateNextWeekSummary = (availability: {
    [key: string]: { start: Date; end: Date }[];
  }) => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    let summary = "";

    Object.entries(availability).forEach(([day, blocks]) => {
      summary += `${day}:\n`;
      blocks.forEach((block) => {
        const startTime = new Date(block.start);
        const endTime = new Date(block.end);
        if (startTime >= today && startTime <= nextWeek) {
          summary += `  ${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\n`;
        }
      });
      summary += "\n";
    });

    return summary;
  };

  const generateRecommendationsSummary = (recs: Recommendation[]) => {
    return recs
      .map((rec) => `<strong>${rec.text}</strong>: ${rec.times.join(", ")}`)
      .join("\n\n");
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (!circle) {
    return (
      <div className="flex justify-center items-center">
        Error: Circle not found
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[#364AE8] h-32 mb-6 w-screen -mt-10"></div>
      <div className="container mx-auto flex flex-col gap-y-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-medium mb-2">{circle.name}</h1>
            <div className="text-base text-[#9C9C9C] mb-6 flex justify-between">
              <span>
                {circle.members.map((member) => member.full_name).join(", ")}
              </span>
              <Button variant="link" className="p-0 h-auto text-[#B5B5B5]">
                Edit
              </Button>
            </div>

            <div className="flex flex-col gap-y-8">
              <div>
                <h2 className="text-base font-semibold mb-2 uppercase">
                  Upcoming Events
                </h2>
                <div className="mb-6">
                  {pageData.upcomingEvents.map((event) => (
                    <div
                      key={event.event_id}
                      className="flex items-center justify-between mb-2"
                    >
                      <div className="flex items-center">
                        <Badge className="bg-[#98A3F6] text-white mr-2">
                          <span className="text-xs">{`${formatDate(event.start_timestamp)} - ${formatDate(event.end_timestamp).split(" ")[1]}`}</span>
                        </Badge>
                        <span className="font-medium text-base">
                          {event.name}
                        </span>
                      </div>
                      <span className="text-xs text-[#9C9C9C]">
                        IN{" "}
                        {Math.ceil(
                          (new Date(event.start_timestamp).getTime() -
                            new Date().getTime()) /
                            (1000 * 3600 * 24)
                        )}{" "}
                        DAYS
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-base font-semibold mb-2 uppercase">
                  Suggested Events
                </h2>
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <span className="text-black font-medium text-lg">
                        {recommendation.text}
                      </span>
                      <div className="flex flex-col items-end">
                        {recommendation.times.map((time, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="flex items-center mb-2"
                          >
                            <span className="text-sm text-[#9C9C9C] mr-2">
                              {time}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full px-3 py-1 text-xs font-medium"
                            >
                              <span className="mr-1">Schedule</span>
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-base font-semibold mb-2 uppercase">
                  Plan Event
                </h2>
                <div>
                  <h3 className="text-2xl font-medium mb-2">New Event</h3>
                  <p className="text-base text-[#9C9C9C] mb-2">
                    Choose based on your availabilities and recommendations.
                  </p>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Event Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newEvent.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={newEvent.date}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <label className="block text-base font-medium mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="start_time"
                          value={newEvent.start_time}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-base font-medium mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="end_time"
                          value={newEvent.end_time}
                          onChange={handleInputChange}
                          className="w-full p-2 border rounded"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-base font-medium mb-1">
                        Event Description
                      </label>
                      <textarea
                        name="description"
                        value={newEvent.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Add description..."
                      ></textarea>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowPlusOne"
                        name="allowPlusOne"
                        checked={newEvent.allowPlusOne}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label htmlFor="allowPlusOne" className="text-base">
                        Guests can bring a plus one
                      </label>
                    </div>
                    <div className="flex gap-x-2">
                      <Button type="submit">Create Event</Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

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
              <Button
                onClick={handleEmailButtonClicked}
                disabled={emailButtonClicked}
              >
                {emailButtonClicked ? "Email Sent" : "Send Email Now"}
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

        <div className="flex flex-col">
          <h3 className="text-2xl font-medium mb-4">Past Events</h3>
          <div className="grid grid-cols-5 space-x-2 overflow-x-auto pb-4">
            {pageData.pastEvents.map((event) => (
              <EventCard
                key={event.event_id}
                eventWithAttendance={{
                  ...event,
                  group: circle,
                  event_person_attendance: (event as any)
                    .event_person_attendance,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}