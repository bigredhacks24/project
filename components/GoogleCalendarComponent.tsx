'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from '@/types/calendar';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface FormattedFreePeriods {
    [day: string]: string[];
}

export default function GoogleCalendarComponent() {
    const [freePeriods, setFreePeriods] = useState<FormattedFreePeriods>({});
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const handleAuthClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/google-auth');
            const data = await response.json();
            console.log(data);
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Authentication URL not received');
            }
        } catch (err) {
            setError('Failed to initiate authentication');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let userID: string | undefined = undefined;
        createClient().auth.getUser().then(({ data: { user } }) => {
            userID = user?.id;

            const fetchCalendarData = async () => {
                setIsLoading(true);
                setError(null);
                try {
                    const response = await fetch(`/api/calendar-data?userId=${userID}`);
                    const data = await response.json();
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    setCalendars(data.calendars);
                    setFreePeriods(data.freePeriods);
                } catch (err) {
                    setError('Failed to fetch calendar data');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchCalendarData();
        });

    }, []);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Google Calendar Availability</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col space-y-2 mb-4">
                    <Button onClick={handleAuthClick} disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Authorize Google Calendar'}
                    </Button>
                    {error && <div className="text-red-500">{error}</div>}
                </div>

                {Object.keys(freePeriods).length > 0 && (
                    <ul className="list-disc pl-5">
                        {Object.entries(freePeriods).map(([day, times]) => (
                            <li key={day}>
                                <strong>{day}:</strong>
                                <ul className="list-none pl-5">
                                    {times.map((time, index) => (
                                        <li key={index}>{time}</li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}