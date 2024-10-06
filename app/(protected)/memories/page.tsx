'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Spinner from '@/components/Spinner';
import FileUploadAndGallery from "@/components/FileUploadAndGallery";
import type { EventWithAttendance } from '@/types/general-types';
import { getColorFromString } from '@/utils/utils';

// New component for formatting event time
const formatEventTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const dateOptions: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    const formattedDate = startDate.toLocaleDateString('en-US', dateOptions).toUpperCase();
    const formattedStartTime = startDate.toLocaleTimeString('en-US', timeOptions);
    const formattedEndTime = endDate.toLocaleTimeString('en-US', timeOptions);

    return `${formattedDate}, ${formattedStartTime} - ${formattedEndTime}`;
};

export default function Memories() {
    const [user, setUser] = useState<any>(null);
    const [events, setEvents] = useState<EventWithAttendance[]>([]);
    const [selectedEventWithAttendance, setSelectedEventWithAttendance] = useState<EventWithAttendance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventImages, setEventImages] = useState<{ [key: string]: { url: string, cid: string, isThumbnail: boolean; }[]; }>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                setUser(user);

                if (user) {
                    // Fetch past events
                    const { data: eventsData, error: eventsError } = await supabase
                        .from("event")
                        .select(`
                            *,
                            event_person_attendance!inner (
                                attending,
                                person (
                                    *
                                )
                            ),
                            group (
                                *
                            )
                        `)
                        .eq("event_person_attendance.person_id", user.id)
                        .lt('end_timestamp', new Date().toISOString())
                        .order('start_timestamp', { ascending: false });

                    if (eventsError) throw eventsError;
                    setEvents(eventsData.map((event) => ({
                        ...event,
                        event_person_attendance: event.event_person_attendance.map((attendance) => ({
                            attending: attendance.attending ?? false,
                            person: {
                                person_id: attendance.person?.person_id || "",
                                email: attendance.person?.email || "",
                                full_name: attendance.person?.full_name || "",
                                friends: attendance.person?.friends || [],
                                phone_number: attendance.person?.phone_number || "",
                                profile_picture: attendance.person?.profile_picture || "",
                                refresh_token: attendance.person?.refresh_token || "",
                            }
                        }))
                    })));

                    // Fetch images for each event
                    const imagePromises = eventsData.map(async (event) => {
                        const response = await fetch(`/api/files?eventId=${event.event_id}`);
                        if (response.ok) {
                            const files = await response.json();
                            return { eventId: event.event_id, files };
                        }
                        return { eventId: event.event_id, files: [] };
                    });

                    const imageResults = await Promise.all(imagePromises);
                    const newEventImages = imageResults.reduce((acc, { eventId, files }) => {
                        acc[eventId] = files;
                        return acc;
                    }, {} as { [key: string]: { url: string, cid: string, isThumbnail: boolean; }[]; });

                    setEventImages(newEventImages);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error loading data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEventClick = (event: EventWithAttendance) => {
        setSelectedEventWithAttendance(event);
    };

    const handleUploadClick = (event: EventWithAttendance) => {
        setSelectedEventWithAttendance(event);
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!user) {
        return <div>Please log in to view this page.</div>;
    }

    return (
        <div className="w-[1222px] max-w-[1222px]">
            <div className="mb-12">
                <h1 className="text-black font-roboto text-3xl mb-2 font-medium leading-[1.2] tracking-[0.338px]">
                    Your Memories
                </h1>
                <p className="text-gray-400 font-base text-left">
                    All your past events, in one place.
                </p>
            </div>

            <div className="grid gap-8">
                {events.map((event) => (
                    <div key={event.event_id} className="overflow-x-scroll max-w-full">
                        <div className="mb-4">
                            <p className="text-gray-400 font-semibold mb-2 text-sm">{formatEventTime(event.start_timestamp, event.end_timestamp)}</p>
                            <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
                            <p className="text-gray-500 mt-2 items-center flex">
                                <span
                                    className="inline-flex items-center justify-center size-4 mr-1.5 rounded-full"
                                    style={{ backgroundColor: getColorFromString(event.group?.name || '') }}
                                ></span>
                                {event.group?.name} |&nbsp;<span className="font-extralight"> {event.description ?? "No description for this event~"}</span>
                            </p>
                        </div>

                        {eventImages[event.event_id] && eventImages[event.event_id].length > 0 ? (
                            <div className="overflow-x-scroll max-w-full">
                                <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
                                    {eventImages[event.event_id].map((image, index) => (
                                        <div key={index} className="relative size-60 flex-shrink-0 overflow-hidden rounded-lg">
                                            <img
                                                src={image.url}
                                                alt={`${event.name} - Image ${index + 1}`}
                                                className="w-full h-full object-cover cursor-pointer border border-gray-200 shadow-2xl rounded-lg"
                                                onClick={() => handleEventClick(event)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-64 bg-gray-200 flex items-center justify-center rounded-lg cursor-pointer" onClick={() => handleUploadClick(event)}>
                                <p className="text-gray-500">No images available. Add some now?</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Images</DialogTitle>
                    </DialogHeader>
                    {selectedEventWithAttendance && <FileUploadAndGallery event={selectedEventWithAttendance} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}