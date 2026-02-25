"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  label?: string;
}

export function SectionHeading({ title, subtitle, label }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-12"
    >
      {label && <p className="mono-label text-laser-cyan mb-2">{label}</p>}
      <h2 className="font-heading text-5xl md:text-7xl tracking-wide text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-muted text-sm max-w-xl">{subtitle}</p>
      )}
      <div className="spec-line mt-6 w-32" />
    </motion.div>
  );
}
