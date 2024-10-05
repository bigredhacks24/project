import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
);

export async function GET(req: NextRequest) {
  // Fetch the user's tokens from Supabase
  // You'll need to implement user authentication and get the user's ID
  const userId = 'user_id_here'; // Replace with actual user ID
  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }

  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expiry_date,
    scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.freebusy',
    token_type: 'Bearer',
  };

  oauth2Client.setCredentials(tokens);

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