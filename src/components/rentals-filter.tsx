"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Lightbulb,
  Volume2,
  Monitor,
  Sparkles,
  Zap,
  Wrench,
  Search,
} from "lucide-react";
import Link from "next/link";
import { GlowButton } from "@/components/glow-button";

type RentalItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  dailyRate: number | null;
  description: string;
  specs: string[];
  imageUrl: string;
  available: boolean;
};

const categories = [
  { value: "all", label: "All Gear", icon: Wrench },
  { value: "lighting", label: "Lighting", icon: Lightbulb },
  { value: "audio", label: "Audio", icon: Volume2 },
  { value: "video", label: "Video", icon: Monitor },
  { value: "lasers", label: "Lasers", icon: Zap },
  { value: "sfx", label: "SFX", icon: Sparkles },
];

export function RentalsFilter({ items }: { items: RentalItem[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const prefersReduced = useReducedMotion();

  const filtered = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && setActiveCategory(cat.value)
              }
              aria-pressed={activeCategory === cat.value}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan ${
                activeCategory === cat.value
                  ? "bg-laser-cyan/20 text-laser-cyan border border-laser-cyan/40"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:border-white/20"
              }`}
            >
              <cat.icon className="w-4 h-4" aria-hidden="true" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative lg:ml-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search rental inventory"
            className="w-full lg:w-64 pl-10 pr-4 py-2 rounded bg-surface border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan/40 transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + searchQuery}
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReduced ? false : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={prefersReduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: prefersReduced ? 0 : i * 0.04,
              }}
              className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-laser-cyan/30 transition-all duration-500"
            >
              {/* Image placeholder */}
              <div className="relative h-48 bg-surface-light flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-laser-cyan/10 flex items-center justify-center mb-2">
                    <span className="font-heading text-lg text-laser-cyan">
                      {item.name[0]}
                    </span>
                  </div>
                  <p className="text-xs text-muted mono-label">{item.category}</p>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-heading text-lg tracking-wider uppercase text-foreground leading-tight">
                  {item.name}
                </h3>
                {item.brand && (
                  <p className="text-xs text-muted mt-1">{item.brand}</p>
                )}
                <p className="text-sm text-muted mt-3 line-clamp-2">
                  {item.description}
                </p>

                {item.specs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.specs.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-muted"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  {item.dailyRate ? (
                    <span className="text-lg font-bold gradient-text">
                      ${item.dailyRate}
                      <span className="text-xs text-muted font-normal">/day</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted">Contact for pricing</span>
                  )}
                  <Link
                    href={`/rentals/${item.id}`}
                    className="mono-label !text-laser-cyan border border-laser-cyan/30 px-3 py-1 rounded hover:bg-laser-cyan/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-cyan"
                    aria-label={`View details for ${item.name}`}
                  >
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted text-lg">
            No gear found matching your criteria.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 text-center">
        <p className="text-muted mb-4">
          Our public inventory is a fraction of what we carry. Deep stock
          available on request.
        </p>
        <GlowButton href="/contact" variant="primary">
          Request Custom Quote
        </GlowButton>
      </div>
    </>
  );
}
