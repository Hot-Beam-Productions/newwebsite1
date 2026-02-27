"use client";

import Link from "next/link";
import { Film, Package, Home, Users, Mail, Settings } from "lucide-react";

const quickLinks = [
  { href: "/admin/portfolio", label: "Portfolio", description: "Manage productions", icon: Film },
  { href: "/admin/rentals", label: "Rentals", description: "Equipment catalog", icon: Package },
  { href: "/admin/home", label: "Home Page", description: "Hero & sections", icon: Home },
  { href: "/admin/about", label: "About Page", description: "Story & team", icon: Users },
  { href: "/admin/contact", label: "Contact Page", description: "Form settings", icon: Mail },
  { href: "/admin/brand", label: "Brand & Footer", description: "Site-wide settings", icon: Settings },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage your site content
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-laser-cyan/40"
          >
            <link.icon className="mb-3 h-5 w-5 text-muted transition-colors group-hover:text-laser-cyan" />
            <h2 className="font-heading text-lg tracking-wide text-foreground">
              {link.label}
            </h2>
            <p className="mt-1 text-sm text-muted">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
