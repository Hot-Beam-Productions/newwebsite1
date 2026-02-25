"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Volume2,
  Monitor,
  Sparkles,
  Zap,
  Wrench,
  Search,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { GlowButton } from "@/components/glow-button";

const categories = [
  { value: "all", label: "All Gear", icon: Wrench },
  { value: "lighting", label: "Lighting", icon: Lightbulb },
  { value: "audio", label: "Audio", icon: Volume2 },
  { value: "video", label: "Video", icon: Monitor },
  { value: "lasers", label: "Lasers", icon: Zap },
  { value: "sfx", label: "SFX", icon: Sparkles },
];

// Placeholder rental items — replaced by Sanity data once connected
const placeholderRentals = [
  {
    _id: "1",
    name: "Martin MAC Viper Profile",
    category: "lighting",
    dailyRate: 150,
    brand: "Martin",
    description:
      "1000W high-output profile luminaire with CMY color mixing, dual rotating gobo wheels, and iris.",
    specs: ["1000W", "CMY Color Mixing", "Dual Gobo Wheels"],
    image: null,
  },
  {
    _id: "2",
    name: 'd&b audiotechnik V-Series 12" Line Array',
    category: "audio",
    dailyRate: 200,
    brand: "d&b audiotechnik",
    description:
      "Premium 3-way line array module for medium to large-scale events. Unmatched clarity.",
    specs: ["3-Way", "Passive", "141 dB SPL Max"],
    image: null,
  },
  {
    _id: "3",
    name: "ROE Visual CB5 LED Panel",
    category: "video",
    dailyRate: 120,
    brand: "ROE Visual",
    description:
      '5.77mm pixel pitch LED panel, 500x500mm. Perfect for indoor stage backdrops and IMAG.',
    specs: ["5.77mm Pitch", "500x500mm", "5000 nits"],
    image: null,
  },
  {
    _id: "4",
    name: "Kvant Spectrum 20 Laser",
    category: "lasers",
    dailyRate: 300,
    brand: "Kvant",
    description:
      "20W full-color laser projector with ILDA control. Our flagship laser for massive beam shows.",
    specs: ["20W", "Full Color RGB", "ILDA"],
    image: null,
  },
  {
    _id: "5",
    name: "CryoFX CO2 Jet",
    category: "sfx",
    dailyRate: 75,
    brand: "CryoFX",
    description:
      "DMX-controlled CO2 cryo jet for dramatic plume effects. 25-foot blast height.",
    specs: ["DMX Control", "25ft Height", "CO2"],
    image: null,
  },
  {
    _id: "6",
    name: "Chauvet Rogue R3 Wash",
    category: "lighting",
    dailyRate: 95,
    brand: "Chauvet Professional",
    description:
      "RGBW LED wash moving head with zoom, ideal for stage washes and audience lighting.",
    specs: ["RGBW", "Moving Head", "8-60° Zoom"],
    image: null,
  },
  {
    _id: "7",
    name: "Shure Axient Digital Wireless",
    category: "audio",
    dailyRate: 125,
    brand: "Shure",
    description:
      "Professional digital wireless microphone system with Quadversity reception and ShowLink.",
    specs: ["Digital", "Quadversity", "184MHz Tuning Range"],
    image: null,
  },
  {
    _id: "8",
    name: "MDG theONE Haze Generator",
    category: "sfx",
    dailyRate: 85,
    brand: "MDG",
    description:
      "Industry-standard haze machine producing ultra-fine, even haze for lighting looks.",
    specs: ["Oil-Based", "DMX", "Ultra-Fine Output"],
    image: null,
  },
];

export default function RentalsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const rentals = placeholderRentals;

  const filteredRentals = rentals.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="Gear Rentals"
          subtitle="Professional event production equipment available for rent. All gear is meticulously maintained and show-ready."
        />

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.value
                    ? "bg-laser-cyan/20 text-laser-cyan border border-laser-cyan/40"
                    : "bg-surface border border-border text-muted hover:text-foreground hover:border-white/20"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative lg:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-2 rounded bg-surface border border-border text-foreground placeholder:text-muted text-sm focus:outline-none focus:border-laser-cyan/40 transition-colors"
            />
          </div>
        </div>

        {/* Rental grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredRentals.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="group bg-surface border border-border rounded-lg overflow-hidden hover:border-laser-cyan/30 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-48 bg-surface-light flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-laser-cyan/10 flex items-center justify-center mb-2">
                      <span className="font-heading text-lg text-laser-cyan">
                        {item.name[0]}
                      </span>
                    </div>
                    <p className="text-xs text-muted">Image via Sanity</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-heading text-lg tracking-wider uppercase text-foreground leading-tight">
                      {item.name}
                    </h3>
                  </div>
                  {item.brand && (
                    <p className="text-xs text-muted mt-1">{item.brand}</p>
                  )}
                  <p className="text-sm text-muted mt-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Specs */}
                  {item.specs && item.specs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.specs.map((spec) => (
                        <span
                          key={spec}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-muted"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Rate */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    {item.dailyRate ? (
                      <span className="text-lg font-bold gradient-text">
                        ${item.dailyRate}
                        <span className="text-xs text-muted font-normal">
                          /day
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted">Contact for pricing</span>
                    )}
                    <GlowButton
                      href="/contact"
                      variant="outline"
                      className="!px-3 !py-1 !text-xs"
                    >
                      Inquire
                    </GlowButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredRentals.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted text-lg">
              No gear found matching your criteria.
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted mb-4">
            Need something specific? We have a deep inventory beyond what&apos;s
            listed here.
          </p>
          <GlowButton href="/contact" variant="primary">
            Request Custom Quote
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
