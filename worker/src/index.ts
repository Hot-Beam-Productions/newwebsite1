import { EmailMessage } from "cloudflare:email";
import { createMimeMessage, Mailbox } from "mimetext";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().optional(),
  eventDate: z.string().trim().optional(),
  venue: z.string().trim().optional(),
  eventType: z.string().trim().optional(),
  gearNeeds: z.array(z.string()).optional().default([]),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  turnstileToken: z.string().min(1, "Bot verification token missing"),
});

interface Env {
  SEND_EMAIL: SendEmail;
  TURNSTILE_SECRET_KEY: string;
  ALLOWED_ORIGINS?: string;
  CONTACT_TO_ADDRESS?: string;
  GOOGLE_APPS_SCRIPT_URL?: string;
}

const DEFAULT_ALLOWED_ORIGINS = [
  "https://hotbeamproductions.com",
  "https://www.hotbeamproductions.com",
  "http://localhost:3000",
];

const FROM_ADDRESS = "contact@hotbeamproductions.com";

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const allowedOrigins = getAllowedOrigins(env.ALLOWED_ORIGINS);
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? "*";

    if (request.method === "OPTIONS") {
      if (origin && !allowedOrigins.includes(origin)) {
        return new Response("Forbidden", { status: 403 });
      }
      return corsResponse(null, 204, allowedOrigin);
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (origin && !allowedOrigins.includes(origin)) {
      return new Response("Forbidden", { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return corsResponse({ success: false, error: "Invalid request body" }, 400, allowedOrigin);
    }

    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return corsResponse(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request body" },
        400,
        allowedOrigin
      );
    }

    const turnstileResult = await verifyTurnstile(parsed.data.turnstileToken, env.TURNSTILE_SECRET_KEY);
    if (!turnstileResult) {
      return corsResponse(
        { success: false, error: "Bot verification failed. Please try again." },
        400,
        allowedOrigin
      );
    }

    const toAddress = env.CONTACT_TO_ADDRESS || FROM_ADDRESS;

    try {
      const html = buildEmailHtml(parsed.data);
      const msg = createMimeMessage();
      msg.setSender({ name: "Hot Beam Website", addr: FROM_ADDRESS });
      msg.setRecipient(toAddress);
      msg.setHeader(
        "Reply-To",
        new Mailbox({ addr: parsed.data.email }, { type: "To" }) as unknown as string
      );
      msg.setSubject(
        `Proposal Request from ${parsed.data.name}${parsed.data.eventType ? ` - ${parsed.data.eventType}` : ""}`
      );
      msg.addMessage({ contentType: "text/html", data: html });

      const emailMessage = new EmailMessage(FROM_ADDRESS, toAddress, msg.asRaw());
      await env.SEND_EMAIL.send(emailMessage);
    } catch {
      return corsResponse(
        { success: false, error: "Failed to send message. Please try again." },
        500,
        allowedOrigin
      );
    }

    if (env.GOOGLE_APPS_SCRIPT_URL) {
      void logToGoogleSheet(env.GOOGLE_APPS_SCRIPT_URL, parsed.data, request.headers.get("CF-Connecting-IP"));
    }

    return corsResponse({ success: true }, 200, allowedOrigin);
  },
};

export default worker;

function getAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;

  const parsed = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  if (!response.ok) return false;

  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(data: z.infer<typeof ContactSchema>): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const phone = data.phone ? escapeHtml(data.phone) : "";
  const eventDate = data.eventDate ? escapeHtml(data.eventDate) : "";
  const venue = data.venue ? escapeHtml(data.venue) : "";
  const eventType = data.eventType ? escapeHtml(data.eventType) : "";
  const message = escapeHtml(data.message).replace(/\n/g, "<br />");

  const gearList =
    data.gearNeeds.length > 0
      ? `<p><strong>Production Needs:</strong> ${data.gearNeeds.map((need) => escapeHtml(need)).join(", ")}</p>`
      : "";

  return `
    <h2 style="font-family:system-ui,sans-serif">New Proposal Request</h2>
    <table style="font-family:system-ui,sans-serif;border-collapse:collapse;width:100%">
      <tr><td style="padding:4px 8px;color:#5f6368">Name</td><td style="padding:4px 8px">${name}</td></tr>
      <tr><td style="padding:4px 8px;color:#5f6368">Email</td><td style="padding:4px 8px"><a href="mailto:${email}">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:4px 8px;color:#5f6368">Phone</td><td style="padding:4px 8px">${phone}</td></tr>` : ""}
      ${eventDate ? `<tr><td style="padding:4px 8px;color:#5f6368">Event Date</td><td style="padding:4px 8px">${eventDate}</td></tr>` : ""}
      ${venue ? `<tr><td style="padding:4px 8px;color:#5f6368">Venue</td><td style="padding:4px 8px">${venue}</td></tr>` : ""}
      ${eventType ? `<tr><td style="padding:4px 8px;color:#5f6368">Event Type</td><td style="padding:4px 8px">${eventType}</td></tr>` : ""}
    </table>
    ${gearList}
    <h3 style="font-family:system-ui,sans-serif;margin-top:16px">Project Brief</h3>
    <p style="font-family:system-ui,sans-serif;white-space:normal;background:#f4f6f8;padding:12px;border-radius:4px">${message}</p>
  `;
}

async function logToGoogleSheet(
  endpoint: string,
  data: z.infer<typeof ContactSchema>,
  ipAddress: string | null
): Promise<void> {
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedAt: new Date().toISOString(),
        source: "hotbeam-website",
        ipAddress,
        ...data,
      }),
    });
  } catch {
    // Ignore logging failures to avoid blocking lead intake.
  }
}

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
