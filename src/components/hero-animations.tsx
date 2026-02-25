"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroBeams() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35" aria-hidden="true">
      <motion.div
        className="absolute -top-28 left-[18%] h-[160%] w-px bg-gradient-to-b from-transparent via-laser-cyan/80 to-transparent"
        animate={{ y: ["-12%", "14%", "-12%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-24 left-[49%] h-[160%] w-px bg-gradient-to-b from-transparent via-laser-cyan-dim/70 to-transparent"
        animate={{ y: ["-15%", "18%", "-15%"] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute -top-28 left-[76%] h-[160%] w-px bg-gradient-to-b from-transparent via-laser-cyan/80 to-transparent"
        animate={{ y: ["-10%", "16%", "-10%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
    </div>
  );
}
