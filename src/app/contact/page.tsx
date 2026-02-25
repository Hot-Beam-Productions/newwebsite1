import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Get a Quote | Hot Beam Productions",
  description:
    "Request a production quote for audio, lighting, video, lasers, or SFX. Denver-based, deployed nationwide. Response within one business day.",
};

export default function ContactPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Contact"
          title="Get a Quote"
          subtitle="Send us your event specs. We read riders, respond to technical questions, and quote from real gear lists — not generic packages."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Sidebar */}
          <div className="space-y-8">
            <div>
              <h3 className="font-heading text-2xl tracking-wider uppercase text-foreground mb-6">
                Direct Contact
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:info@hotbeamproductions.com"
                  className="flex items-center gap-3 text-muted hover:text-foreground transition-colors"
                >
                  <Mail
                    className="w-5 h-5 text-laser-cyan flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm">info@hotbeamproductions.com</span>
                </a>
                <a
                  href="tel:+13035551234"
                  className="flex items-center gap-3 text-muted hover:text-foreground transition-colors"
                >
                  <Phone
                    className="w-5 h-5 text-laser-cyan flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm">(303) 555-1234</span>
                </a>
                <div className="flex items-center gap-3 text-muted">
                  <MapPin
                    className="w-5 h-5 text-laser-cyan flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Denver, Colorado</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border">
              <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-3">
                Response Time
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                One business day for quote requests. Same day for urgent
                inquiries — call us directly.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-surface border border-border">
              <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-3">
                Service Area
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Based in Denver. We work the entire Front Range regularly and
                travel nationally for the right shows. Ask about touring rates.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
