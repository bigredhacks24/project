"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Database } from '@/types/database.types';
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";

type CircleData = Database['public']['Tables']['group']['Row'] & {
    members: { full_name: string; email: string; }[];
};

type Event = {
    date: string;
    time: string;
    title: string;
    status?: string;
};

type CirclePageData = {
    name: string;
    members: string[];
    upcomingEvents: Event[];
    suggestedEvents: Event[];
    availabilityNotification: string;
    pastEvents: Event[];
};

const dummyData: CirclePageData = {
    name: "BRH Squad",
    members: ["Valerie Wong", "Jasmine Li", "Simon Ilincev", "Temi Adebowale"],
    upcomingEvents: [
        { date: "10/8", time: "5PM-7PM", title: "Picnic on the Slope", status: "IN 2 DAYS" }
    ],
    suggestedEvents: [
        { date: "10/8", time: "5PM-7PM", title: "Game Night at Valerie's Apartment" },
        { date: "10/8", time: "5PM-7PM", title: "Game Night at Valerie's Apartment" },
        { date: "10/8", time: "5PM-7PM", title: "Game Night at Valerie's Apartment" }
    ],
    availabilityNotification: "Email weekly with common availabilities for the next week",
    pastEvents: [
        { date: "10/8", time: "5PM-7PM", title: "Past Event 1" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 2" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 3" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 4" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" },
        { date: "10/8", time: "5PM-7PM", title: "Past Event 5" }
    ]
};

export default function CirclePage() {
    const { id } = useParams();
    const [circle, setCircle] = useState<CircleData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageData, setPageData] = useState<CirclePageData>(dummyData);

    useEffect(() => {
        const fetchCircleData = async () => {
            try {
                const response = await fetch(`/api/groups?groupId=${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch circle data');
                }
                const data = await response.json();
                if (data && data.length > 0) {
                    setCircle({
                        ...data[0].group,
                        members: data.map((item: any) => item.person)
                    });
                    // Here you would update pageData with real data from the API
                    // setPageData({ ... });
                }
            } catch (error) {
                console.error('Error fetching circle data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCircleData();
    }, [id]);

    if (isLoading) {
        return <Spinner />;
    }

    if (!circle) {
        return <div className="flex justify-center items-center">Error: Circle not found</div>;
    }

    return (
        <div>
            <div className="bg-[#364AE8] h-32 mb-6 w-screen -mt-10"></div>
            <div className="container mx-auto flex flex-col gap-y-10 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h1 className="text-3xl font-medium mb-2">{pageData.name}</h1>
                        <div className="text-base text-[#9C9C9C] mb-6 flex justify-between"><span>{pageData.members.join(", ")}</span>
                            <Button variant="link" className="p-0 h-auto text-[#B5B5B5]">Edit</Button>
                        </div>


                        <div className="flex flex-col gap-y-8">
                            <div>
                                <h2 className="text-base font-semibold mb-2 uppercase">Upcoming Events</h2>
                                <div className="mb-6">
                                    {pageData.upcomingEvents.map((event, index) => (
                                        <div key={index} className="flex items-center justify-between mb-2">
                                            <Badge className="bg-[#98A3F6] text-white mr-2">
                                                <span className="text-xs">{`${event.date}, ${event.time}`}</span>
                                            </Badge>
                                            <span className="text-xs text-[#9C9C9C]">{event.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-base font-semibold mb-2 uppercase">Suggested Events</h2>
                                {pageData.suggestedEvents.map((event, index) => (
                                    <div key={index} className="flex items-center justify-between space-y-1">
                                        <div className="flex items-center">
                                            <Badge className="bg-[#CACBCC] text-white mr-2">
                                                <span className="text-xs">{`${event.date}, ${event.time}`}</span>
                                            </Badge>
                                            <span className="font-medium text-base">{event.title}</span>
                                        </div>
                                        <Button variant="default" size="sm">Send Invite</Button>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h2 className="text-base font-semibold mb-2 uppercase">Plan Event</h2>
                                <div>
                                    <h3 className="text-2xl font-medium mb-2">New Event</h3>
                                    <p className="text-base text-[#9C9C9C] mb-2">Choose based on your availabilities and recommendations.</p>
                                    <form className="space-y-4">
                                        <div>
                                            <label className="block text-base font-medium mb-1">Pick a date</label>
                                            <select className="w-full p-2 border rounded">
                                                <option>Select date</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-1">Pick a time</label>
                                            <div className="flex space-x-2">
                                                <select className="w-1/2 p-2 border rounded">
                                                    <option>Start time</option>
                                                </select>
                                                <select className="w-1/2 p-2 border rounded">
                                                    <option>End time</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-1">Choose activity (based on your shared interests)</label>
                                            <select className="w-full p-2 border rounded">
                                                <option>Select activity</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-base font-medium mb-1">Event Description</label>
                                            <textarea className="w-full p-2 border rounded" placeholder="Add description..."></textarea>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" id="plusOne" className="mr-2" />
                                            <label htmlFor="plusOne" className="text-base">Guests can bring a plus one</label>
                                        </div>
                                        <div className="flex gap-x-2">
                                            <Button variant="outline">Back</Button>
                                            <Button>Send invite</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:mt-[0.85rem]">
                        <h2 className="text-base font-semibold mb-2 uppercase">Availability Notifications</h2>
                        <div className="mb-6 flex justify-between items-center">
                            <p className="font-medium text-base">{pageData.availabilityNotification}</p>
                            <Button variant="link" className="p-0 h-auto text-[#B5B5B5]">Edit</Button>
                        </div>

                        <h2 className="text-base font-semibold mb-2 uppercase">Common Availability</h2>
                        <canvas className="mb-6 mx-auto w-full bg-slate-200 h-[620px]"></canvas>
                    </div>

                </div>

                <div className="flex flex-col">
                    <h3 className="text-2xl font-medium mb-4">Past Events</h3>
                    <div className="flex space-x-2 overflow-x-auto pb-4">
                        {pageData.pastEvents.map((event, index) => (
                            <EventCard key={index} eventAttendance={{
                                event: {
                                    event_id: index.toString(),
                                    group_id: circle.group_id,
                                    name: event.title,
                                    creation_timestamp: "2024-01-01",
                                    start_timestamp: "2024-01-01",
                                    end_timestamp: "2024-01-01",
                                },
                                group: circle,
                                attending: index === 0 ? true : false
                            }} />
                            // <div key={index} className={`flex-shrink-0 w-24 h-24 rounded ${index === 0 ? 'bg-blue-500' : 'bg-gray-200'} flex items-end p-2`}>
                            //     <span className="text-xs text-white">{`${event.date}, ${event.time}`}</span>
                            // </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}