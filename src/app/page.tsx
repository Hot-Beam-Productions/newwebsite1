import Image from "next/image";
import {
  Volume2,
  Lightbulb,
  Monitor,
  Zap,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { SectionHeading } from "@/components/section-heading";
import { HeroBeams } from "@/components/hero-animations";
import { InstagramFeed } from "@/components/instagram-feed";
import { PreShowSequence } from "@/components/pre-show-sequence";

const services = [
  {
    icon: Volume2,
    title: "Audio",
    description:
      "d&b audiotechnik and L-Acoustics line arrays. From a 300-person general session to a 10,000-capacity festival main stage, we size and tune the system to the room — not the rental invoice.",
  },
  {
    icon: Lightbulb,
    title: "Lighting",
    description:
      "grandMA3 programming, MAC Ultra fixtures, and Robe moving heads. Full touring rigs and corporate one-offs. Patch to blackout, we handle the full technical workflow.",
  },
  {
    icon: Monitor,
    title: "Video",
    description:
      "ROE LED walls, Barco processing, and Resolume media servers. Whether it's a 40-tile stage backdrop or a 3-screen corporate confidence system, we engineer the signal chain.",
  },
  {
    icon: Zap,
    title: "Lasers",
    description:
      "FDA-registered Class IIIb and IV systems. Kvant Spectrum RGBW projectors, ILDA time-code sync, and custom beam choreography. We hold the variance, we run the show.",
  },
  {
    icon: Sparkles,
    title: "SFX",
    description:
      "CryoFX CO2 cannons, MDG haze, confetti, and flame effects. We integrate SFX into the lighting and audio cue stack so the drops hit on time, every time.",
  },
];

// Lasers is the featured service; the rest go in the secondary stack
const lasersService = services.find((s) => s.title === "Lasers")!;
const secondaryServices = services.filter((s) => s.title !== "Lasers");

export default function Home() {
  return (
    <>
      <PreShowSequence />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-clip pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-background" />
        <HeroBeams />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-medium tracking-[0.3em] uppercase text-laser-cyan mb-6">
            Denver, CO — Live Event Production
          </p>

          <div className="overflow-hidden">
            <Image
              src="/logo.png"
              alt="Hot Beam Productions"
              width={600}
              height={164}
              className="w-[400px] sm:w-[500px] md:w-[600px] h-auto mx-auto drop-shadow-[0_0_40px_rgba(0,245,255,0.2)]"
              priority
            />
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-wider uppercase text-foreground/80 mt-2">
            Audio · Lighting · Lasers · Video · SFX
          </h2>

          <p className="mt-8 text-muted text-base max-w-2xl mx-auto leading-relaxed">
            We build production rigs for touring acts, festivals, corporate events, and private
            shows. Tier-1 gear, experienced crew, honest quotes. Based in Denver — deployed
            everywhere.
          </p>

          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <GlowButton href="/work" variant="primary">
              See Our Work
              <ArrowRight className="inline ml-2 w-4 h-4" aria-hidden="true" />
            </GlowButton>
            <GlowButton href="/contact" variant="outline">
              Get a Quote
            </GlowButton>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Services */}
      <section className="py-24 px-6" aria-labelledby="services-heading">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            label="Capabilities"
            title="What We Do"
            subtitle="Full-service production with the technical depth to execute at any scale. We own our gear, we employ our crew, and we show up ready to work."
          />

          {/* SERVICES GRID — brutalist lattice */}
          <div
            id="services-heading"
            className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-border mt-12"
          >
            {/* FEATURED: Lasers — 2/3 width */}
            <div className="lg:col-span-2 bg-background p-10 md:p-14 relative overflow-hidden">
              {/* Ghost section number */}
              <span
                className="section-number absolute -right-6 -top-8 select-none"
                aria-hidden="true"
              >
                01
              </span>
              {/* Icon */}
              <div className="w-12 h-12 bg-laser-cyan/10 flex items-center justify-center mb-6">
                <lasersService.icon
                  className="w-6 h-6 text-laser-cyan"
                  aria-hidden="true"
                />
              </div>
              {/* Service name */}
              <h3 className="type-section text-foreground mt-4 mb-4">
                {lasersService.title}
              </h3>
              {/* Description */}
              <p className="type-body-light text-muted max-w-lg mb-8">
                {lasersService.description}
              </p>
              {/* Gear specs as mono-label list */}
              <div className="space-y-1">
                <p className="type-label-bold text-laser-amber mb-2">
                  KEY INVENTORY
                </p>
                <p className="mono-label text-muted">
                  Kvant Spectrum Series / ILDA Sync / 40kW Output
                </p>
                <p className="mono-label text-muted">
                  FDA Registered / DMX512 + ArtNet Control
                </p>
              </div>
            </div>

            {/* SECONDARY SERVICES STACK — 1/3 width */}
            <div className="bg-background divide-y divide-border">
              {secondaryServices.map((service, index) => (
                <div
                  key={service.title}
                  className="relative p-6 overflow-hidden group hover:bg-surface transition-colors duration-300"
                >
                  <span
                    className="section-number absolute -right-4 -top-6 select-none"
                    aria-hidden="true"
                  >
                    0{index + 2}
                  </span>
                  {/* Icon */}
                  <div className="w-8 h-8 bg-laser-cyan/10 flex items-center justify-center mb-2 group-hover:bg-laser-cyan/20 transition-colors">
                    <service.icon
                      className="w-4 h-4 text-laser-cyan"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-display font-bold text-2xl uppercase text-foreground mt-2 mb-2">
                    {service.title}
                  </h3>
                  <p className="type-body-light text-muted text-sm">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed */}
      <InstagramFeed />

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl md:text-6xl font-bold tracking-wider uppercase gradient-text">
            Your Rider. Our Rig.
          </h2>
          <p className="mt-6 text-muted text-base max-w-xl mx-auto leading-relaxed">
            Send us the event specs and we&apos;ll build a quote from the ground up — no canned
            packages, no hidden labor charges.
          </p>
          <div className="mt-10">
            <GlowButton href="/contact" variant="primary">
              Start Your Project
              <ArrowRight className="inline ml-2 w-4 h-4" aria-hidden="true" />
            </GlowButton>
          </div>
        </div>
      </section>
    </>
  );
}
