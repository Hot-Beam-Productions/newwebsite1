"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, Monitor, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ServiceIcon } from "@/lib/site-data";

const iconMap: Record<ServiceIcon, React.ComponentType<{ className?: string }>> = {
  lightbulb: Lightbulb,
  monitor: Monitor,
  zap: Zap,
  sparkles: Sparkles,
};

interface ServiceItem {
  id: string;
  icon: ServiceIcon;
  title: string;
  description: string;
  highlights: string[];
}

interface ServicesAccordionProps {
  items: ServiceItem[];
  defaultOpenId?: string;
}

export function ServicesAccordion({ items, defaultOpenId }: ServicesAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);

  return (
    <div className="mt-10 divide-y divide-border border border-border">
      {items.map((service, index) => {
        const Icon = iconMap[service.icon];
        const isOpen = openId === service.id;

        return (
          <div key={service.id} className="bg-background">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : service.id)}
              className={cn(
                "group flex w-full items-center justify-between px-6 py-5 text-left transition-colors md:px-10 md:py-6",
                isOpen ? "bg-surface" : "hover:bg-surface/60"
              )}
              aria-expanded={isOpen}
              aria-controls={`service-panel-${service.id}`}
            >
              <div className="flex items-center gap-4">
                <span
                  className="section-number text-4xl font-heading text-border-bright md:text-5xl"
                  aria-hidden="true"
                >
                  0{index + 1}
                </span>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center border transition-colors",
                      isOpen
                        ? "border-laser-cyan/50 bg-laser-cyan/20"
                        : "border-laser-cyan/30 bg-laser-cyan/10 group-hover:bg-laser-cyan/15"
                    )}
                  >
                    <Icon className="h-4 w-4 text-laser-cyan" aria-hidden="true" />
                  </div>
                  <h3
                    className={cn(
                      "font-heading text-2xl tracking-tight transition-colors md:text-3xl",
                      isOpen ? "text-laser-cyan" : "text-foreground"
                    )}
                  >
                    {service.title}
                  </h3>
                </div>
              </div>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isOpen ? "text-laser-cyan" : "text-muted"
                  )}
                  aria-hidden="true"
                />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`service-panel-${service.id}`}
                  role="region"
                  aria-labelledby={`service-heading-${service.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-8 pt-2 md:px-10 md:pl-[6.5rem]">
                    <p className="max-w-2xl text-base leading-relaxed text-muted">
                      {service.description}
                    </p>
                    <div className="mt-6 space-y-2">
                      {service.highlights.map((highlight) => (
                        <p key={highlight} className="mono-label !text-muted-light">
                          {highlight}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
