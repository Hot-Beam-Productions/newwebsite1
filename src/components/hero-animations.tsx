"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroBeams() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-55" aria-hidden="true">
      {/* Far left beam */}
      <motion.div
        className="absolute -top-32 left-[5%] h-[180%] w-[2px] bg-gradient-to-b from-transparent via-laser-cyan/70 to-transparent"
        animate={{ y: ["-14%", "16%", "-14%"] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      {/* Left beam */}
      <motion.div
        className="absolute -top-32 left-[18%] h-[180%] w-[2px] bg-gradient-to-b from-transparent via-laser-cyan/90 to-transparent"
        animate={{ y: ["-12%", "14%", "-12%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Left-center beam */}
      <motion.div
        className="absolute -top-28 left-[33%] h-[180%] w-px bg-gradient-to-b from-transparent via-laser-cyan-dim/60 to-transparent"
        animate={{ y: ["-10%", "15%", "-10%"] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
      />
      {/* Center beam */}
      <motion.div
        className="absolute -top-28 left-[49%] h-[180%] w-[2px] bg-gradient-to-b from-transparent via-laser-cyan/85 to-transparent"
        animate={{ y: ["-15%", "18%", "-15%"] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Right-center beam */}
      <motion.div
        className="absolute -top-32 left-[64%] h-[180%] w-px bg-gradient-to-b from-transparent via-laser-cyan-dim/55 to-transparent"
        animate={{ y: ["-8%", "13%", "-8%"] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
      />
      {/* Right beam */}
      <motion.div
        className="absolute -top-32 left-[76%] h-[180%] w-[2px] bg-gradient-to-b from-transparent via-laser-cyan/90 to-transparent"
        animate={{ y: ["-10%", "16%", "-10%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      {/* Far right beam */}
      <motion.div
        className="absolute -top-28 left-[92%] h-[180%] w-[2px] bg-gradient-to-b from-transparent via-laser-cyan/65 to-transparent"
        animate={{ y: ["-13%", "15%", "-13%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
      />
    </div>
  );
}
