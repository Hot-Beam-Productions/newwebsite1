"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/section-heading";
import { GlowButton } from "@/components/glow-button";
import { ArrowRight, Zap, Users, Award, MapPin } from "lucide-react";

const stats = [
  { label: "Events Produced", value: "500+", icon: Zap },
  { label: "Team Members", value: "25+", icon: Users },
  { label: "Years in Denver", value: "10+", icon: MapPin },
  { label: "Awards", value: "12", icon: Award },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="About Us"
          subtitle="The story behind Denver's most creative event production company."
        />

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-heading text-3xl tracking-wider uppercase text-foreground mb-6">
              Built by Creatives, for Creatives
            </h3>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Hot Beam Productions was founded by Daniel and Beau with a
                simple belief: event production should be an art form, not just
                a service. Based in Denver, Colorado, we started with a passion
                for light, sound, and the transformative power of live
                experiences.
              </p>
              <p>
                What began as two friends running laser shows at local venues
                has grown into a full-service production company trusted by
                major brands, festivals, and private clients across the Front
                Range and beyond.
              </p>
              <p>
                We&apos;re not the biggest production company — and that&apos;s
                our advantage. We move fast, think creatively, and treat every
                event like it&apos;s our own. Where the industry giants deliver
                standard packages, we deliver custom experiences.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Placeholder for team photo */}
            <div className="aspect-[4/3] rounded-lg bg-surface border border-border flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-hotbeam-red/10 flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-hotbeam-red" />
                </div>
                <p className="text-muted text-sm">Team photo</p>
                <p className="text-xs text-muted/60 mt-1">
                  Upload via Sanity Studio
                </p>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-4 -right-4 w-full h-full border border-hotbeam-red/20 rounded-lg -z-10" />
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="text-center p-8 rounded-lg bg-surface border border-border"
            >
              <stat.icon className="w-6 h-6 text-hotbeam-red mx-auto mb-4" />
              <p className="font-heading text-4xl font-bold gradient-text">
                {stat.value}
              </p>
              <p className="text-sm text-muted mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Values */}
        <div className="mb-24">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-4xl tracking-wider uppercase gradient-text mb-10"
          >
            Why Hot Beam?
          </motion.h3>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Creative Edge",
                description:
                  "We don't just set up gear — we design experiences. Every event gets a custom creative concept tailored to your vision.",
              },
              {
                title: "High-Tech Arsenal",
                description:
                  "From 20W lasers to the latest LED walls, our inventory is built for impact. We invest in the gear others rent out.",
              },
              {
                title: "Agile & Reliable",
                description:
                  "We move at the speed of your deadlines. Small team, big output. No corporate red tape — just results.",
              },
            ].map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                className="p-8 rounded-lg bg-surface border border-border hover:border-hotbeam-red/30 transition-all duration-500"
              >
                <h4 className="font-heading text-xl tracking-wider uppercase text-foreground mb-3">
                  {value.title}
                </h4>
                <p className="text-muted text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="font-heading text-4xl tracking-wider uppercase text-foreground mb-4">
            Let&apos;s Create Something Together
          </h3>
          <p className="text-muted mb-8 max-w-lg mx-auto">
            Tell us about your next event and we&apos;ll show you what&apos;s
            possible.
          </p>
          <GlowButton href="/contact" variant="primary">
            Start a Conversation
            <ArrowRight className="inline ml-2 w-4 h-4" />
          </GlowButton>
        </motion.div>
      </div>
    </div>
  );
}
