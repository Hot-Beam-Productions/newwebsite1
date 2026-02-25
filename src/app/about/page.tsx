import type { Metadata } from "next";
import { ArrowRight, Zap, Users, Award, MapPin } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { SectionHeading } from "@/components/section-heading";
import { MediaPlaceholder } from "@/components/media-placeholder";
import teamData from "@/data/team.json";

export const metadata: Metadata = {
  title: "About | Hot Beam Productions",
  description:
    "Denver-based live event production company. Co-founded by Daniel Mankin and Beau. Full-service audio, lighting, video, lasers, and SFX. Front Range and nationwide.",
};

const stats = [
  { label: "Events Produced", value: "500+", icon: Zap },
  { label: "Team Members", value: "15+", icon: Users },
  { label: "Years Operating", value: "10+", icon: MapPin },
  { label: "States Deployed", value: "12+", icon: Award },
];

export default function AboutPage() {
  const { partners, crew } = teamData;

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="The Company"
          title="About Us"
          subtitle="Two co-founders. Fifteen years of combined stage experience. One production company that moves at the speed of the industry."
        />

        {/* Partners — 50/50 layout */}
        <section className="mb-24" aria-labelledby="partners-heading">
          <p id="partners-heading" className="mono-label text-laser-cyan mb-8">
            Founders
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="p-8 rounded-lg bg-surface border border-border hover:border-laser-cyan/20 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-light">
                    {partner.imageUrl && !partner.imageUrl.includes("pub-XXXX") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={partner.imageUrl}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MediaPlaceholder
                        label="Headshot"
                        aspect="square"
                        className="!aspect-auto !h-full"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl tracking-wider text-foreground">
                      {partner.name}
                    </h3>
                    <p className="mono-label text-laser-cyan mt-1">{partner.role}</p>
                    <p className="text-sm text-muted mt-4 leading-relaxed">
                      {partner.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <div>
            <h3 className="font-heading text-4xl tracking-wider uppercase text-foreground mb-6">
              Built for the Show Floor
            </h3>
            <div className="space-y-4 text-muted leading-relaxed text-sm">
              <p>
                Hot Beam started because we were tired of watching under-spec&apos;d gear show
                up to high-stakes gigs. We built our inventory around the fixtures we actually
                wanted to run — MAC Vipers, Kvant lasers, d&b line arrays — and we maintain
                it ourselves.
              </p>
              <p>
                We operate as a tight crew. No layers between the client and the people
                actually running the show. Daniel advances the technical rider. Beau runs
                logistics and crew. Both of us are on-site, every time, until load-out is
                complete.
              </p>
              <p>
                Our clients are TDs and event planners who&apos;ve been burned before by
                production companies that oversell and under-deliver. We quote
                conservatively, communicate early, and solve problems before the first truck
                rolls.
              </p>
            </div>
          </div>
          <div className="relative">
            <MediaPlaceholder
              label="Team / BTS photography"
              aspect="portrait"
              className="rounded-lg"
            />
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-laser-cyan/15 rounded-lg -z-10" />
          </div>
        </section>

        {/* Stats */}
        <section
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
          aria-label="Company statistics"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-8 rounded-lg bg-surface border border-border"
            >
              <stat.icon
                className="w-6 h-6 text-laser-cyan mx-auto mb-4"
                aria-hidden="true"
              />
              <p className="font-heading text-4xl font-bold gradient-text">
                {stat.value}
              </p>
              <p className="text-sm text-muted mt-2">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* Values */}
        <section className="mb-24">
          <h3 className="font-heading text-4xl tracking-wider uppercase gradient-text mb-10">
            Why Hot Beam?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Technical Depth",
                description:
                  "We can read a rider, spec a system, and program a show. We don't hand off technical decisions to vendors — we own them.",
              },
              {
                title: "Tier 1 Inventory",
                description:
                  "MAC Vipers. d&b line arrays. Kvant lasers. grandMA3 consoles. We bought the gear that touring riders call for and we keep it in working condition.",
              },
              {
                title: "Small Crew Advantage",
                description:
                  "Fast decisions, direct communication, no account managers between you and the people doing the work. We move when you need to move.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="p-8 rounded-lg bg-surface border border-border hover:border-laser-cyan/30 transition-all duration-500 scanline-overlay"
              >
                <h4 className="font-heading text-xl tracking-wider uppercase text-foreground mb-3">
                  {value.title}
                </h4>
                <p className="text-muted text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Crew */}
        {crew.length > 0 && (
          <section className="mb-24">
            <p className="mono-label text-laser-cyan mb-6">Crew</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {crew.map((member) => (
                <div key={member.id} className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-surface-light mb-3">
                    {member.imageUrl && !member.imageUrl.includes("pub-XXXX") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MediaPlaceholder
                        label=""
                        aspect="square"
                        className="!aspect-auto !h-full"
                      />
                    )}
                  </div>
                  <p className="text-sm text-foreground">{member.name}</p>
                  <p className="mono-label mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="text-center">
          <h3 className="font-heading text-4xl tracking-wider uppercase text-foreground mb-4">
            Let&apos;s Run a Show Together
          </h3>
          <p className="text-muted mb-8 max-w-lg mx-auto text-sm">
            Send us your rider, your venue specs, and your timeline. We&apos;ll come back
            with a real quote from the people who&apos;ll be on-site.
          </p>
          <GlowButton href="/contact" variant="primary">
            Start a Conversation
            <ArrowRight className="inline ml-2 w-4 h-4" aria-hidden="true" />
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
