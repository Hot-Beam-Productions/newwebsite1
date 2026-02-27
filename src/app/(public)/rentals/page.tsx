import type { Metadata } from "next";
import { RentalsFilter } from "@/components/rentals-filter";
import { SectionHeading } from "@/components/section-heading";
import { rentals } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Inventory",
  description:
    "Browse show-ready inventory from Hot Beam Productions including lighting, audio, video, laser, and effects systems.",
};

export default function RentalsPage() {
  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label={rentals.heading.label}
          title={rentals.heading.title}
          subtitle={rentals.heading.subtitle}
        />
        <RentalsFilter items={rentals.items} categories={rentals.categories} footerNote={rentals.footerNote} />
      </div>
    </div>
  );
}
