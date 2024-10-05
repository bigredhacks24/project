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
    const calendars = calendarList.data.items ?? [];

    // Calculate time range (9 AM to midnight for the next 7 days)
    const freePeriods = await getFreePeriods(calendar, calendars);

    return NextResponse.json({ calendars, freePeriods });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

async function getFreePeriods(calendar: any, calendars: any[]) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const freePeriods: { [key: string]: string[] } = {};

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const day = days[date.getDay()];

    const startTime = new Date(date.setHours(9, 0, 0, 0));
    const endTime = new Date(date.setHours(23, 59, 59, 999));

    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        items: calendars.map(calendar => ({ id: calendar.id })),
      },
    });

    const busyPeriods = Object.values(freeBusyResponse.data.calendars)
      .flatMap((cal: any) => cal.busy || [])
      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());

    const dayFreePeriods = getFreePeriodsBetweenBusy(startTime, endTime, busyPeriods);
    freePeriods[day] = dayFreePeriods;
  }

  return freePeriods;
}

function getFreePeriodsBetweenBusy(start: Date, end: Date, busyPeriods: any[]) {
  const freePeriods: string[] = [];
  let currentTime = new Date(start);

  for (const busy of busyPeriods) {
    const busyStart = new Date(busy.start);
    if (currentTime < busyStart) {
      freePeriods.push(`${formatTime(currentTime)} - ${formatTime(busyStart)}`);
    }
    currentTime = new Date(busy.end);
  }

  if (currentTime < end) {
    freePeriods.push(`${formatTime(currentTime)} - ${formatTime(end)}`);
  }

  return freePeriods;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}