import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PRIVATE_GOOGLE_CLIENT_ID,
  process.env.NEXT_PRIVATE_GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/gcal/callback`
);

// Initialize Supabase client
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    const userEmail = userInfo.data.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Store tokens in Supabase
    const { data, error } = await supabase
      .from('person')
      .update({ refresh_token: tokens.refresh_token })
      .eq('email', userEmail);

    if (error) {
      console.error('Error storing tokens:', error);
      return NextResponse.json({ error: 'Failed to store tokens' }, { status: 500 });
    }

    console.log('Tokens stored successfully');

    // Redirect to a success page or your app's main page
    return NextResponse.redirect(new URL('/home', req.url));
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}