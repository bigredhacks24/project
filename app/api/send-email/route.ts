import { NextResponse } from "next/server";
import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

export async function POST(req: Request) {
  const { to, subject, body } = await req.json();

  if (!process.env.MAILGUN_API_KEY) {
    console.error("Mailgun API key is not set");
    return NextResponse.json(
      { error: "Email service API key is not configured" },
      { status: 500 }
    );
  }

  if (!process.env.MAILGUN_DOMAIN) {
    console.error("Mailgun domain is not set");
    return NextResponse.json(
      { error: "Email service domain is not configured" },
      { status: 500 }
    );
  }

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
  });

  try {
    console.log("Attempting to send email to:", to);
    console.log("Using Mailgun domain:", process.env.MAILGUN_DOMAIN);

    const msg = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Circles App <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: [to],
      subject: subject,
      text: body,
      html: `
        <p>${body}</p>
        <p>Click <a href="${process.env.NEXT_PUBLIC_URL}/signup">here</a> to sign up.</p>
      `,
    });

    console.log("Mailgun response:", JSON.stringify(msg, null, 2));
    
    return NextResponse.json(
      { message: "Invitation sent successfully", mailgunResponse: msg },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in send-email API route:", error);
    return NextResponse.json(
      {
        error: `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
        details: error,
      },
      { status: 500 }
    );
  }
}
