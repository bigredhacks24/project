'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_KEY = process.env.NEXT_PUBLIC_GCLOUD_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

interface TokenClient {
    callback: (resp: any) => void;
    requestAccessToken: (options: { prompt: string; }) => void;
}

interface BusyPeriod {
    start: string;
    end: string;
}

interface FormattedBusyPeriods {
    [day: string]: string[];
}

export default function GoogleCalendarComponent() {
    const [gapiInited, setGapiInited] = useState<boolean>(false);
    const [gisInited, setGisInited] = useState<boolean>(false);
    const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
    const [busyPeriods, setBusyPeriods] = useState<FormattedBusyPeriods>({});
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        if (gapiInited && gisInited) {
            initializeGapiClient();
        }
    }, [gapiInited, gisInited]);

    const initializeGapiClient = async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
    };

    const handleAuthClick = () => {
        if (!tokenClient) return;

        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                throw resp;
            }
            // Set the access token when received
            setAccessToken(resp.access_token);
            // Set the refresh token if available
            if (resp.refresh_token) {
                setRefreshToken(resp.refresh_token);
            }
            await fetchFreeBusy();
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    };

    const handleSignoutClick = () => {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.id.revoke(token.access_token, () => {
                console.log('Token revoked');
                gapi.client.setToken(null);
                setBusyPeriods({});
                setAccessToken(null); // Clear the access token on sign out
                setRefreshToken(null); // Clear the refresh token on sign out
            });
        }
    };

    const fetchFreeBusy = async () => {
        const now = new Date();
        const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        try {
            const response = await gapi.client.request({
                path: 'https://www.googleapis.com/calendar/v3/freeBusy',
                method: 'POST',
                body: {
                    timeMin: now.toISOString(),
                    timeMax: oneWeekLater.toISOString(),
                    items: [{ id: 'primary' }]
                }
            });

            const busyPeriods = response.result.calendars.primary.busy;
            const formattedBusyPeriods = formatBusyPeriods(busyPeriods);
            setBusyPeriods(formattedBusyPeriods);
        } catch (err) {
            console.error('Error fetching free/busy information:', err);
        }
    };

    const formatBusyPeriods = (periods: BusyPeriod[]): FormattedBusyPeriods => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formattedPeriods: FormattedBusyPeriods = {};

        periods.forEach(period => {
            const start = new Date(period.start);
            const end = new Date(period.end);
            const day = days[start.getDay()];
            const timeString = `${formatTime(start)} - ${formatTime(end)}`;

            if (!formattedPeriods[day]) {
                formattedPeriods[day] = [];
            }
            formattedPeriods[day].push(timeString);
        });

        return formattedPeriods;
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    const handleGapiLoad = () => {
        gapi.load('client', () => setGapiInited(true));
    };
    const handleGisLoad = () => {
        const tokenClient = (google.accounts as any).oauth2.initTokenClient({
            client_id: CLIENT_ID as string,
            scope: SCOPES,
            callback: '', // defined later
        });
        setTokenClient(tokenClient);
        setGisInited(true);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Google Calendar Availability</CardTitle>
            </CardHeader>
            <CardContent>
                <Script src="https://apis.google.com/js/api.js" onLoad={handleGapiLoad} />
                <Script src="https://accounts.google.com/gsi/client" onLoad={handleGisLoad} />

                <div className="flex flex-col space-y-2 mb-4">
                    <div className="flex space-x-2">
                        <Button onClick={handleAuthClick} disabled={!gapiInited || !gisInited}>
                            Authorize
                        </Button>
                        <Button onClick={handleSignoutClick} disabled={!gapiInited || !gisInited} variant="outline">
                            Sign Out
                        </Button>
                    </div>
                    {accessToken && (
                        <div className="text-sm break-all">
                            <strong>Access Token:</strong> {accessToken}
                        </div>
                    )}
                    {refreshToken && (
                        <div className="text-sm break-all">
                            <strong>Refresh Token:</strong> {refreshToken}
                        </div>
                    )}
                </div>

                {Object.keys(busyPeriods).length > 0 && (
                    <ul className="list-disc pl-5">
                        {Object.entries(busyPeriods).map(([day, times]) => (
                            <li key={day}>
                                <strong>{day}:</strong> {times.join(', ')}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}