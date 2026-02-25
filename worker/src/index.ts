import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";
import { z } from "zod";

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

interface Env {
  SEND_EMAIL: SendEmail;
  TURNSTILE_SECRET_KEY: string;
}

const ALLOWED_ORIGINS = [
  "https://hotbeamproductions.com",
  "https://www.hotbeamproductions.com",
  "http://localhost:3000",
];

const FROM_ADDRESS = "contact@hotbeamproductions.com";
const TO_ADDRESS = "contact@hotbeamproductions.com";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";

    if (request.method === "OPTIONS") {
      return corsResponse(null, 204, origin);
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return corsResponse({ success: false, error: "Invalid request body" }, 400, origin);
    }

    // Validate with Zod
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return corsResponse(
        { success: false, error: parsed.error.issues[0].message },
        400,
        origin
      );
    }

    // Verify Turnstile
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: parsed.data.turnstileToken,
        }),
      }
    );
    const verifyData = (await verifyRes.json()) as { success: boolean };
    if (!verifyData.success) {
      return corsResponse(
        { success: false, error: "Bot verification failed. Please try again." },
        400,
        origin
      );
    }

    // Build email HTML
    const { name, email, phone, eventDate, venue, eventType, gearNeeds, message } =
      parsed.data;

    const gearList =
      gearNeeds && gearNeeds.length > 0
        ? `<p><strong>Gear Needed:</strong> ${gearNeeds.join(", ")}</p>`
        : "";

    const html = `
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
    `;

    // Send via Email Workers binding
    try {
      const msg = createMimeMessage();
      msg.setSender({ name: "Hot Beam Website", addr: FROM_ADDRESS });
      msg.setRecipient(TO_ADDRESS);
      msg.setHeader("Reply-To", email);
      msg.setSubject(`Quote Request from ${name}${eventType ? ` — ${eventType}` : ""}`);
      msg.addMessage({ contentType: "text/html", data: html });

      const emailMessage = new EmailMessage(FROM_ADDRESS, TO_ADDRESS, msg.asRaw());
      await env.SEND_EMAIL.send(emailMessage);
    } catch {
      return corsResponse(
        { success: false, error: "Failed to send message. Please try again." },
        500,
        origin
      );
    }

    return corsResponse({ success: true }, 200, origin);
  },
};

function corsResponse(body: unknown, status: number, origin: string): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
