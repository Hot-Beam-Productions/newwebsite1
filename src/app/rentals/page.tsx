import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { RentalsFilter } from "@/components/rentals-filter";
import rentals from "@/data/rentals.json";

export const metadata: Metadata = {
  title: "Gear Rental Inventory | Hot Beam Productions",
  description:
    "Professional event production equipment for rent. Lasers, line arrays, LED walls, moving lights, SFX. Show-ready inventory, maintained to touring spec.",
};

export default function RentalsPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Inventory"
          title="Gear Rentals"
          subtitle="Touring-spec equipment. Every unit is maintained, tested, and show-ready. Prices are day rates — multi-day and package pricing available on request."
        />
        <RentalsFilter items={rentals} />
      </div>
    </div>
  );
}
