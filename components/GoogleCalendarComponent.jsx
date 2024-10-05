'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_KEY = process.env.NEXT_PUBLIC_GCLOUD_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

export default function GoogleCalendarComponent() {
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [busyPeriods, setBusyPeriods] = useState([]);

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

    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw resp;
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
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      setBusyPeriods([]);
    }
  };

  const fetchFreeBusy = async () => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    try {
      const response = await gapi.client.calendar.freebusy.query({
        timeMin: now.toISOString(),
        timeMax: oneWeekLater.toISOString(),
        items: [{ id: 'primary' }]
      });

      const busyPeriods = response.result.calendars.primary.busy;
      const formattedBusyPeriods = formatBusyPeriods(busyPeriods);
      setBusyPeriods(formattedBusyPeriods);
    } catch (err) {
      console.error('Error fetching free/busy information:', err);
    }
  };

  const formatBusyPeriods = (periods) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedPeriods = {};

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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleGapiLoad = () => {
    gapi.load('client', () => setGapiInited(true));
  };

  const handleGisLoad = () => {
    setTokenClient(google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    }));
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

        <div className="flex space-x-2 mb-4">
          <Button onClick={handleAuthClick} disabled={!gapiInited || !gisInited}>
            Authorize
          </Button>
          <Button onClick={handleSignoutClick} disabled={!gapiInited || !gisInited} variant="outline">
            Sign Out
          </Button>
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