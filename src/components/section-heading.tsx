"use client";

import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <h2 className="font-heading text-5xl md:text-7xl font-bold tracking-wider uppercase gradient-text">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-muted text-lg max-w-2xl">{subtitle}</p>
      )}
      <div className="mt-6 h-[2px] w-24 bg-gradient-to-r from-hotbeam-red to-hotbeam-orange" />
    </motion.div>
  );
}
