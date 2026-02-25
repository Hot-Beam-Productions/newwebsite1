"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface GlowButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}

export function GlowButton({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
  disabled,
}: GlowButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-sm border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    primary: cn(
      "border-laser-cyan bg-laser-cyan text-background",
      "hover:translate-y-[-1px] hover:bg-laser-cyan-dim hover:shadow-[0_0_22px_rgba(46,99,255,0.35)]",
      "active:translate-y-0"
    ),
    outline: cn(
      "border-laser-cyan/55 bg-transparent text-laser-cyan",
      "hover:border-laser-cyan hover:bg-laser-cyan/12 hover:text-laser-cyan"
    ),
  };

  const classes = cn(
    baseStyles,
    variants[variant],
    disabled && "cursor-not-allowed opacity-55",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
