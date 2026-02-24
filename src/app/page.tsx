"use client";

import { motion } from "framer-motion";
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

const services = [
  {
    icon: Volume2,
    title: "Audio",
    description:
      "Full-scale sound systems, from intimate corporate events to arena-sized festivals. Crystal-clear audio that moves the crowd.",
  },
  {
    icon: Lightbulb,
    title: "Lighting",
    description:
      "Architectural lighting, intelligent fixtures, and custom designs that transform any venue into a visual masterpiece.",
  },
  {
    icon: Monitor,
    title: "Video",
    description:
      "LED walls, projection mapping, and live IMAG that deliver stunning visual impact at every scale.",
  },
  {
    icon: Zap,
    title: "Lasers",
    description:
      "High-powered laser systems that cut through the darkness with precision. Our signature specialty.",
  },
  {
    icon: Sparkles,
    title: "SFX",
    description:
      "Cryo jets, flame effects, confetti, and haze — the finishing touches that make moments unforgettable.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-background" />

        {/* Animated beams */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <motion.div
            className="absolute top-0 left-1/4 w-[2px] h-full bg-gradient-to-b from-transparent via-hotbeam-red to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-hotbeam-orange to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-0 left-3/4 w-[2px] h-full bg-gradient-to-b from-transparent via-hotbeam-red to-transparent"
            animate={{ y: ["-100%", "100%"] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
              delay: 2,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm font-medium tracking-[0.3em] uppercase text-hotbeam-red mb-6"
            >
              Denver Event Production
            </motion.p>

            {/* "HOT BEAM" laser-cut text */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="font-heading text-7xl sm:text-8xl md:text-9xl font-bold tracking-wider uppercase text-glow gradient-text"
              >
                Hot Beam
              </motion.h1>
            </div>

            <div className="overflow-hidden mt-2">
              <motion.h2
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-wider uppercase text-foreground/80"
              >
                Experience the Art of Illumination
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-8 text-muted text-lg max-w-2xl mx-auto"
            >
              Audio. Lighting. Video. Lasers. SFX. We craft immersive
              experiences that push the boundaries of live event production.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="mt-10 flex gap-4 justify-center flex-wrap"
            >
              <GlowButton href="/work" variant="primary">
                See Our Work
                <ArrowRight className="inline ml-2 w-4 h-4" />
              </GlowButton>
              <GlowButton href="/contact" variant="outline">
                Get a Quote
              </GlowButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Services Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            title="What We Do"
            subtitle="Full-service event production with cutting-edge technology and creative precision."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                className="group relative p-8 rounded-lg bg-surface border border-border hover:border-hotbeam-red/30 transition-all duration-500 scanline-overlay"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-hotbeam-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-hotbeam-red/10 flex items-center justify-center mb-6 group-hover:bg-hotbeam-red/20 transition-colors">
                    <service.icon className="w-6 h-6 text-hotbeam-red" />
                  </div>
                  <h3 className="font-heading text-2xl tracking-wider uppercase text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-5xl md:text-6xl font-bold tracking-wider uppercase gradient-text">
              Ready to Elevate Your Event?
            </h2>
            <p className="mt-6 text-muted text-lg max-w-xl mx-auto">
              Whether it&apos;s a corporate gala, a music festival, or a private
              party — we bring the production value that sets you apart.
            </p>
            <div className="mt-10">
              <GlowButton href="/contact" variant="primary">
                Start Your Project
                <ArrowRight className="inline ml-2 w-4 h-4" />
              </GlowButton>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
