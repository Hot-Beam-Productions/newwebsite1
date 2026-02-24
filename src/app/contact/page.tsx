"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/section-heading";
import { GlowButton } from "@/components/glow-button";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  venue: string;
  eventType: string;
  gearNeeds: string[];
  message: string;
}

const gearOptions = [
  "Audio / PA System",
  "Lighting Design",
  "Video / LED Walls",
  "Lasers",
  "SFX (Cryo, Flame, Haze)",
  "Full Production Package",
];

const inputStyles =
  "w-full px-4 py-3 rounded bg-surface border border-border text-foreground placeholder:text-muted/60 text-sm focus:outline-none focus:border-hotbeam-red/40 transition-colors";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormData>();

  const onSubmit = async (data: QuoteFormData) => {
    // In production, replace with Web3Forms or your preferred form handler
    console.log("Form data:", data);
    setSubmitted(true);
  };

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="Get a Quote"
          subtitle="Tell us about your event and we'll put together a custom production package."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="font-heading text-2xl tracking-wider uppercase text-foreground mb-6">
                Get in Touch
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:info@hotbeamproductions.com"
                  className="flex items-center gap-3 text-muted hover:text-foreground transition-colors"
                >
                  <Mail className="w-5 h-5 text-hotbeam-red" />
                  <span className="text-sm">info@hotbeamproductions.com</span>
                </a>
                <a
                  href="tel:+13035551234"
                  className="flex items-center gap-3 text-muted hover:text-foreground transition-colors"
                >
                  <Phone className="w-5 h-5 text-hotbeam-red" />
                  <span className="text-sm">(303) 555-1234</span>
                </a>
                <div className="flex items-center gap-3 text-muted">
                  <MapPin className="w-5 h-5 text-hotbeam-red" />
                  <span className="text-sm">Denver, Colorado</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border">
              <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-3">
                Response Time
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                We typically respond within 24 hours. For urgent requests,
                give us a call directly.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border">
              <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-3">
                Service Area
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Based in Denver, we serve the entire Front Range and travel
                nationwide for the right projects.
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            {submitted ? (
              <div className="text-center py-20">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h3 className="font-heading text-3xl tracking-wider uppercase text-foreground mb-4">
                  Message Sent
                </h3>
                <p className="text-muted max-w-md mx-auto">
                  Thanks for reaching out! We&apos;ll review your event details
                  and get back to you with a custom quote.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-muted mb-2">
                      Name *
                    </label>
                    <input
                      {...register("name", { required: "Name is required" })}
                      className={inputStyles}
                      placeholder="Your name"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email address",
                        },
                      })}
                      className={inputStyles}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone & Event Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-muted mb-2">
                      Phone
                    </label>
                    <input
                      {...register("phone")}
                      className={inputStyles}
                      placeholder="(303) 555-1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      {...register("eventDate", {
                        required: "Event date is required",
                      })}
                      className={inputStyles}
                    />
                    {errors.eventDate && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.eventDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Venue & Event Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-muted mb-2">
                      Venue
                    </label>
                    <input
                      {...register("venue")}
                      className={inputStyles}
                      placeholder="Venue name or location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted mb-2">
                      Event Type
                    </label>
                    <select {...register("eventType")} className={inputStyles}>
                      <option value="">Select type...</option>
                      <option value="concert">Concert / Festival</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="wedding">Wedding</option>
                      <option value="private">Private Party</option>
                      <option value="conference">Conference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Gear Needs */}
                <div>
                  <label className="block text-sm text-muted mb-3">
                    What do you need?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {gearOptions.map((gear) => (
                      <label
                        key={gear}
                        className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-foreground transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={gear}
                          {...register("gearNeeds")}
                          className="rounded border-border bg-surface text-hotbeam-red focus:ring-hotbeam-red/40"
                        />
                        {gear}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm text-muted mb-2">
                    Tell us more about your event
                  </label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    className={inputStyles}
                    placeholder="Describe your event, expected attendance, any special requirements..."
                  />
                </div>

                <GlowButton type="submit" variant="primary">
                  <Send className="w-4 h-4 mr-2 inline" />
                  Send Quote Request
                </GlowButton>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
