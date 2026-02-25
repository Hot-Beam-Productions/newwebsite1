"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroBeams() {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return null;

  return (
    <div
      className="absolute inset-0 overflow-hidden opacity-15"
      aria-hidden="true"
    >
      <motion.div
        className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-laser-cyan to-transparent"
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-laser-cyan-dim to-transparent"
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
      />
      <motion.div
        className="absolute top-0 left-3/4 w-[1px] h-full bg-gradient-to-b from-transparent via-laser-cyan to-transparent"
        animate={{ y: ["-100%", "100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 2 }}
      />
    </div>
  );
}
