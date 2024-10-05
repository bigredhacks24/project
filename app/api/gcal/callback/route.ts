import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PRIVATE_GOOGLE_CLIENT_ID,
  process.env.NEXT_PRIVATE_GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/gcal/callback`
);

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.freebusy'
];

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    console.log('Attempting to get tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens received:', tokens);

    oauth2Client.setCredentials(tokens);

    // Get user info
    console.log('Attempting to get user info...');
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    console.log('User info received:', userInfo.data);

    const userEmail = userInfo.data.email;
    console.log(`User email: ${userEmail}`);

    // Store tokens in Supabase
    const { data, error } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_email: userEmail,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      }, {
        onConflict: 'user_email'
      });

    if (error) {
      console.error('Error storing tokens:', error);
      return NextResponse.json({ error: 'Failed to store tokens' }, { status: 500 });
    }

    // Redirect to a success page or your app's main page
    return NextResponse.redirect(new URL('/calendar', req.url));
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}