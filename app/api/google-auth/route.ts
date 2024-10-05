import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

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

export const runtime = 'edge';

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  return NextResponse.json({ url: authUrl });
}