"use client";

import { RentalForm } from "@/components/admin/rental-form";
import { createRental } from "../actions";

export default function NewRentalPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">New Rental Item</h1>
        <p className="mt-1 text-sm text-muted">Add equipment to your inventory</p>
      </div>
      <RentalForm onSubmit={(data) => createRental(data)} submitLabel="Create Item" />
    </div>
  );
}
