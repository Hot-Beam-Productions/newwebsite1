"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-border bg-surface/50 p-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted" />
      <h2 className="mt-4 font-heading text-xl tracking-wide text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center rounded-md bg-laser-cyan px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
