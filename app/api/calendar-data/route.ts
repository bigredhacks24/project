import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PRIVATE_GOOGLE_CLIENT_ID,
  process.env.NEXT_PRIVATE_GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/gcal/callback`
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // Fetch the user's tokens from Supabase
  const { data: userData, error: userError } = await supabase
    .from('person')
    .select('refresh_token, email')
    .eq('person_id', userId)
    .single();

  if (userError || !userData || !userData.refresh_token) {
    console.error('Error fetching user data:', userError);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }

  // Set up OAuth2 client with refresh token
  oauth2Client.setCredentials({
    refresh_token: userData.refresh_token,
  });

  // Refresh the access token
  try {
    await oauth2Client.refreshAccessToken();
  } catch (refreshError) {
    console.error('Error refreshing access token:', refreshError);
    return NextResponse.json({ error: 'Failed to refresh access token' }, { status: 500 });
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    // Fetch calendar list
    const calendarList = await calendar.calendarList.list();
    const calendars = calendarList.data.items;

    // Calculate time range (now to one week later)
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch busy periods
    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: oneWeekLater.toISOString(),
        items: calendars?.map(calendar => ({ id: calendar.id })) || [],
      },
    });

    const busyPeriods = formatBusyPeriods(freeBusyResponse.data.calendars);

    return NextResponse.json({ calendars, busyPeriods });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

function formatBusyPeriods(calendars: any) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const formattedPeriods: { [key: string]: string[]; } = {};

  Object.values(calendars).forEach((calendar: any) => {
    if (calendar.busy) {
      calendar.busy.forEach((period: any) => {
        const start = new Date(period.start);
        const end = new Date(period.end);
        const day = days[start.getDay()];
        const timeString = `${formatTime(start)} - ${formatTime(end)}`;

        if (!formattedPeriods[day]) {
          formattedPeriods[day] = [];
        }
        formattedPeriods[day].push(timeString);
      });
    }
  });

  return formattedPeriods;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}