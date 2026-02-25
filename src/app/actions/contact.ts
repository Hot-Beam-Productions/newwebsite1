"use server";

import { z } from "zod";
import nodemailer from "nodemailer";

const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  eventDate: z.string().optional(),
  venue: z.string().optional(),
  eventType: z.string().optional(),
  gearNeeds: z.array(z.string()).optional().default([]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  turnstileToken: z.string().min(1, "Bot verification token missing"),
});

export type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    eventDate: formData.get("eventDate") || undefined,
    venue: formData.get("venue") || undefined,
    eventType: formData.get("eventType") || undefined,
    gearNeeds: formData.getAll("gearNeeds") as string[],
    message: formData.get("message"),
    turnstileToken: formData.get("cf-turnstile-response"),
  };

  // 1. Validate input
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // 2. Verify Turnstile token
  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: parsed.data.turnstileToken,
      }),
    }
  );
  const verifyData = (await verifyRes.json()) as { success: boolean };
  if (!verifyData.success) {
    return {
      success: false,
      error: "Bot verification failed. Please try again.",
    };
  }

  // 3. Send email via nodemailer (Google Workspace SMTP)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const {
    name,
    email,
    phone,
    eventDate,
    venue,
    eventType,
    gearNeeds,
    message,
  } = parsed.data;

  const gearList =
    gearNeeds && gearNeeds.length > 0
      ? `<p><strong>Gear Needed:</strong> ${gearNeeds.join(", ")}</p>`
      : "";

  await transporter.sendMail({
    from: `"Hot Beam Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_TO,
    replyTo: email,
    subject: `Quote Request from ${name}${eventType ? ` — ${eventType}` : ""}`,
    html: `
      <h2 style="font-family:monospace">New Quote Request</h2>
      <table style="font-family:monospace;border-collapse:collapse;width:100%">
        <tr><td style="padding:4px 8px;color:#666">Name</td><td style="padding:4px 8px">${name}</td></tr>
        <tr><td style="padding:4px 8px;color:#666">Email</td><td style="padding:4px 8px"><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:4px 8px;color:#666">Phone</td><td style="padding:4px 8px">${phone}</td></tr>` : ""}
        ${eventDate ? `<tr><td style="padding:4px 8px;color:#666">Event Date</td><td style="padding:4px 8px">${eventDate}</td></tr>` : ""}
        ${venue ? `<tr><td style="padding:4px 8px;color:#666">Venue</td><td style="padding:4px 8px">${venue}</td></tr>` : ""}
        ${eventType ? `<tr><td style="padding:4px 8px;color:#666">Event Type</td><td style="padding:4px 8px">${eventType}</td></tr>` : ""}
      </table>
      ${gearList}
      <h3 style="font-family:monospace;margin-top:16px">Message</h3>
      <p style="font-family:monospace;white-space:pre-wrap;background:#f5f5f5;padding:12px;border-radius:4px">${message}</p>
    `,
  });

  return { success: true };
}
