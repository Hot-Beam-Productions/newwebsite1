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
    "relative inline-flex items-center justify-center px-8 py-3 font-semibold text-sm rounded transition-all duration-300 group overflow-hidden";

  const variants = {
    primary: cn(
      "bg-gradient-to-r from-hotbeam-red to-hotbeam-orange text-white",
      "hover:shadow-[0_0_30px_rgba(255,77,77,0.4),0_0_60px_rgba(255,140,0,0.2)]",
      "active:scale-[0.98]"
    ),
    outline: cn(
      "border border-hotbeam-red/40 text-hotbeam-red bg-transparent",
      "hover:bg-hotbeam-red/10 hover:border-hotbeam-red",
      "hover:shadow-[0_0_20px_rgba(255,77,77,0.2)]"
    ),
  };

  const classes = cn(baseStyles, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      <span className="relative z-10">{children}</span>
    </button>
  );
}
