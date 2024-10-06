"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database.types";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";
import WeeklyCalendar from "@/components/WeeklyCalendar";
import FileUploadAndGallery from "@/components/FileUploadAndGallery";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EventWithAttendance } from "@/types/general-types";

type CircleData = Database["public"]["Tables"]["group"]["Row"] & {
    members: Database["public"]["Tables"]["person"]["Row"][];
};

type Event = Database["public"]["Tables"]["event"]["Row"];

type CirclePageData = {
    upcomingEvents: Event[];
    suggestedEvents: Event[];
    pastEvents: Event[];
};

export default function CirclePage() {
    const { id } = useParams();
    const [circle, setCircle] = useState<CircleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageData, setPageData] = useState<CirclePageData>({
        upcomingEvents: [],
        suggestedEvents: [],
        pastEvents: [],
    });
    const [commonAvailability, setCommonAvailability] = useState<
        { start: Date; end: Date; }[]
    >([
        { start: new Date(2024, 9, 8, 10, 0), end: new Date(2024, 9, 8, 12, 0) },
        { start: new Date(2024, 9, 9, 14, 0), end: new Date(2024, 9, 9, 16, 0) },
        { start: new Date(2024, 9, 11, 9, 0), end: new Date(2024, 9, 11, 11, 0) },
        { start: new Date(2024, 9, 12, 13, 0), end: new Date(2024, 9, 12, 15, 0) },
        { start: new Date(2024, 9, 14, 15, 0), end: new Date(2024, 9, 14, 18, 0) },
    ]);
    const [newEvent, setNewEvent] = useState({
        name: "",
        date: "",
        start_time: "",
        end_time: "",
        description: "",
        allowPlusOne: false,
    });
    const [selectedEventWithAttendance, setselectedEventWithAttendance] = useState<EventWithAttendance | null>(null);

    useEffect(() => {
        const fetchCircleData = async () => {
            try {
                const response = await fetch(`/api/groups?groupId=${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch circle data");
                }
                const data = await response.json();
                if (data && data.length > 0) {
                    setCircle({
                        ...data[0].group,
                        members: data.map((item: any) => item.person),
                    });

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
                        suggestedEvents: [], // You might want to implement a suggestion algorithm here
                        pastEvents,
                    });
                }
            } catch (error) {
                console.error("Error fetching circle data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCircleData();
    }, [id]);

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
                                {pageData.suggestedEvents.map((event) => (
                                    <div
                                        key={event.event_id}
                                        className="flex items-center justify-between space-y-1"
                                    >
                                        <div className="flex items-center">
                                            <Badge className="bg-[#CACBCC] text-white mr-2">
                                                <span className="text-xs">{`${formatDate(event.start_timestamp)} - ${formatDate(event.end_timestamp).split(" ")[1]}`}</span>
                                            </Badge>
                                            <span className="font-medium text-base">
                                                {event.name}
                                            </span>
                                        </div>
                                        <Button variant="default" size="sm">
                                            Send Invite
                                        </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pageData.pastEvents.map((event) => (
                            <div key={event.event_id}>
                                <div onClick={() => setselectedEventWithAttendance({
                                    ...event,
                                    group: circle,
                                    event_person_attendance: (event as any).event_person_attendance,
                                })}>
                                    <EventCard
                                        eventWithAttendance={{
                                            ...event,
                                            group: circle,
                                            event_person_attendance: (event as any).event_person_attendance,
                                        }}
                                    />
                                </div>
                                <Dialog open={!!selectedEventWithAttendance} onOpenChange={() => setselectedEventWithAttendance(null)}>
                                    <DialogContent>
                                        {selectedEventWithAttendance && <FileUploadAndGallery event={selectedEventWithAttendance} />}
                                    </DialogContent>
                                </Dialog>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}