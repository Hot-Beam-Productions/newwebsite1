"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

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
  disabled = false,
}: GlowButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center px-6 py-2.5 text-xs font-mono font-medium tracking-wider uppercase transition-all duration-150";

  const variants = {
    primary: cn(
      "bg-laser-cyan text-background border border-laser-cyan",
      "hover:bg-laser-cyan-dim hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]",
      "active:scale-[0.98]"
    ),
    outline: cn(
      "border border-laser-cyan/40 text-laser-cyan bg-transparent",
      "hover:bg-laser-cyan/10 hover:border-laser-cyan",
      "active:scale-[0.98]"
    ),
  };

  const classes = cn(
    baseStyles,
    variants[variant],
    disabled && "pointer-events-none opacity-60",
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
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
