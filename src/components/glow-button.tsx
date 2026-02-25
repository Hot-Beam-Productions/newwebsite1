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
}

export function GlowButton({
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
}: GlowButtonProps) {
  const baseStyles =
    "relative inline-flex items-center justify-center px-6 py-2.5 text-xs font-mono font-medium tracking-wider uppercase transition-all duration-150";

  const variants = {
    primary: cn(
      "bg-laser-red text-white border border-laser-red",
      "hover:bg-laser-red-dim hover:shadow-[0_0_20px_rgba(255,77,77,0.3)]",
      "active:scale-[0.98]"
    ),
    outline: cn(
      "border border-laser-red/40 text-laser-red bg-transparent",
      "hover:bg-laser-red/10 hover:border-laser-red",
      "active:scale-[0.98]"
    ),
  };

  const classes = cn(baseStyles, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
