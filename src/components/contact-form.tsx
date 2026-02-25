"use client";

import { useActionState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import {
  submitContactForm,
  type ContactFormState,
} from "@/app/actions/contact";

const inputStyles =
  "w-full px-4 py-3 rounded bg-surface border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/40 transition-colors";

const initialState: ContactFormState = { success: false };

const gearOptions = [
  "Audio / PA System",
  "Lighting Design",
  "Video / LED Walls",
  "Lasers",
  "SFX (Cryo, Haze, Confetti)",
  "Full Production Package",
];

export function ContactForm() {
  const [state, action, pending] = useActionState(
    submitContactForm,
    initialState
  );
  const [turnstileToken, setTurnstileToken] = useState("");

  if (state.success) {
    return (
      <div className="text-center py-20" role="status">
        <CheckCircle
          className="w-16 h-16 text-laser-cyan mx-auto mb-6"
          aria-hidden="true"
        />
        <h3 className="font-heading text-3xl tracking-wider uppercase text-foreground mb-4">
          Message Sent
        </h3>
        <p className="text-muted max-w-md mx-auto text-sm">
          Got it. We&apos;ll review your specs and reply within one business
          day. For urgent requests, call us directly.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      {/* Hidden Turnstile token */}
      <input
        type="hidden"
        name="cf-turnstile-response"
        value={turnstileToken}
      />

      {/* Invisible Turnstile widget */}
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={setTurnstileToken}
        options={{ size: "invisible" }}
      />

      {/* Error state */}
      {state.error && (
        <div
          className="flex items-center gap-3 p-4 rounded bg-red-950/30 border border-red-900/40 text-red-400 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {state.error}
        </div>
      )}

      {/* Name & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm text-muted mb-2">
            Name <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            className={inputStyles}
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-muted mb-2">
            Email <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputStyles}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
      </div>

      {/* Phone & Event Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm text-muted mb-2">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={inputStyles}
            placeholder="(303) 555-0100"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="eventDate" className="block text-sm text-muted mb-2">
            Event Date
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            className={inputStyles}
          />
        </div>
      </div>

      {/* Venue & Event Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="venue" className="block text-sm text-muted mb-2">
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            className={inputStyles}
            placeholder="Venue name or address"
          />
        </div>
        <div>
          <label
            htmlFor="eventType"
            className="block text-sm text-muted mb-2"
          >
            Event Type
          </label>
          <select id="eventType" name="eventType" className={inputStyles}>
            <option value="">Select type...</option>
            <option value="Concert / Festival">Concert / Festival</option>
            <option value="Corporate Event">Corporate Event</option>
            <option value="Conference">Conference</option>
            <option value="Wedding">Wedding</option>
            <option value="Private Event">Private Event</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Gear Needs */}
      <fieldset>
        <legend className="block text-sm text-muted mb-3">
          What do you need?
        </legend>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {gearOptions.map((gear) => (
            <label
              key={gear}
              className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-foreground transition-colors"
            >
              <input
                type="checkbox"
                name="gearNeeds"
                value={gear}
                className="rounded border-border bg-surface text-laser-cyan focus:ring-laser-cyan/40 focus-visible:ring-2"
              />
              {gear}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm text-muted mb-2">
          Tell us about your event <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          minLength={10}
          className={inputStyles}
          placeholder="Describe your event, expected attendance, technical requirements, or share your rider..."
        />
      </div>

      <GlowButton
        type="submit"
        variant="primary"
        className={pending ? "opacity-60 cursor-wait" : ""}
      >
        <Send className="w-4 h-4 mr-2 inline" aria-hidden="true" />
        {pending ? "Sending..." : "Send Quote Request"}
      </GlowButton>
    </form>
  );
}
