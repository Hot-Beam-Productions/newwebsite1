"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 text-sm text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted/70" />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/40"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground" : "text-muted"}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
