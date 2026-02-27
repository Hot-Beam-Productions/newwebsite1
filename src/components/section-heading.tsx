"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  label?: string;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  label,
  className,
}: SectionHeadingProps) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn("mb-12", className)}
    >
      {label && <p className="mono-label mb-3 !text-laser-cyan">{label}</p>}
      <h2 className="font-heading text-4xl leading-[1.03] tracking-tight text-foreground md:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-light">
          {subtitle}
        </p>
      )}
      <div className="spec-line mt-7 w-36" />
    </motion.div>
  );
}
