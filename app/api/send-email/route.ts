import { NextResponse } from "next/server";
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || ''
});

export async function POST(req: Request) {
  const { to, subject, body } = await req.json();

  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error("Mailgun API key or domain is not set");
    return NextResponse.json({ error: "Email service is not configured properly" }, { status: 500 });
  }

  try {
    const msg = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Circles App <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: [to],
      subject: subject,
      text: body,
      html: `
        <p>${body}</p>
        <p>Click <a href="${process.env.NEXT_PUBLIC_URL}/signup">here</a> to sign up.</p>
      `
    });

    console.log('Email sent:', msg);
    return NextResponse.json({ message: "Invitation sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in send-email API route:", error);
    return NextResponse.json({ error: `Failed to send email: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
  }
}