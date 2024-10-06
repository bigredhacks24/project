import { createClient } from "@/utils/supabase/client";

export async function sendEmail(to: string, subject: string, body: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, body }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Email sending failed:', data);
      throw new Error(data.error || 'Failed to send invitation');
    }

    console.log(`Invitation sent successfully to ${to}`);
    return data;
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    throw error;
  }
}