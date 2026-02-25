"use client";

import { motion } from "framer-motion";
import type { InventoryItem } from "@/lib/zoho-connector";

interface RentalCardProps {
  item: InventoryItem;
  index?: number;
}

export function RentalCard({ item, index = 0 }: RentalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.03, ease: "easeOut" }}
      className="group bg-surface border border-border hover:border-laser-cyan/40 transition-colors duration-200"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-light">
        <span className="mono-label text-laser-cyan">{item.category}</span>
        <span className="mono-label">
          {item.available ? "IN STOCK" : "ON RENTAL"}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Model name */}
        <div>
          <h3 className="font-heading text-2xl tracking-wide text-foreground leading-none">
            {item.name}
          </h3>
          <p className="mono-label mt-1">{item.brand}</p>
        </div>

        {/* Spec grid */}
        <div className="spec-line" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {item.model && (
            <div>
              <span className="mono-label block">MODEL</span>
              <span className="text-sm text-foreground">{item.model}</span>
            </div>
          )}
          {item.wattage && (
            <div>
              <span className="mono-label block">WATTAGE</span>
              <span className="text-sm text-foreground">{item.wattage}W</span>
            </div>
          )}
          <div>
            <span className="mono-label block">WEIGHT</span>
            <span className="text-sm text-foreground">{item.weight}</span>
          </div>
          <div>
            <span className="mono-label block">DAILY RATE</span>
            <span className="text-sm text-laser-cyan font-semibold">
              ${item.dailyRate}
            </span>
          </div>
        </div>

        {/* Specs tags */}
        {item.specs.length > 0 && (
          <>
            <div className="spec-line" />
            <div className="flex flex-wrap gap-1.5">
              {item.specs.map((spec) => (
                <span
                  key={spec}
                  className="mono-label px-2 py-0.5 border border-border-bright text-muted-light"
                >
                  {spec}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-surface-light flex items-center justify-between">
        <span className="mono-label">
          HBP-{item.id.toUpperCase().slice(0, 8)}
        </span>
        <a
          href="/contact"
          className="mono-label text-laser-cyan hover:text-foreground transition-colors"
        >
          REQUEST QUOTE &rarr;
        </a>
      </div>
    </motion.div>
  );
}
