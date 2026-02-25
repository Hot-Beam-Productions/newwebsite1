"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { brand, navigation } from "@/lib/site-data";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(46,99,255,0.18),transparent_40%)]" />
      <div className="relative mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center" aria-label={brand.name}>
          <Image
            src={brand.heroLogo}
            alt={brand.name}
            width={170}
            height={46}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "mono-label transition-colors",
                isActive(pathname, link.href)
                  ? "!text-laser-cyan"
                  : "!text-muted-light hover:!text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="mono-label rounded-sm border border-laser-cyan/50 px-4 py-2 !text-laser-cyan transition-all hover:bg-laser-cyan/12"
          >
            Start Project
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen((state) => !state)}
          className="text-foreground md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative border-t border-border/70 bg-background md:hidden"
          >
            <div className="px-6 py-4">
              <div className="flex flex-col gap-3">
                {navigation.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "mono-label !text-sm transition-colors",
                      isActive(pathname, link.href)
                        ? "!text-laser-cyan"
                        : "!text-muted-light hover:!text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
