import {
  getSiteDoc,
  updateSiteDoc,
  getCollectionDocs,
  getDocById,
  setDocument,
  deleteDocument,
} from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { rentalSchema } from "@/lib/schemas";
import type { RentalItem, RentalsSettings } from "@/lib/types";

export async function getRentalsAdmin(): Promise<RentalItem[]> {
  return getCollectionDocs<RentalItem>("rentals");
}

export async function getRentalAdmin(id: string): Promise<RentalItem | null> {
  return getDocById<RentalItem>("rentals", id);
}

export async function createRental(
  data: RentalItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = rentalSchema.parse(data);
    await setDocument("rentals", parsed.id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create rental" };
  }
}

export async function updateRental(
  id: string,
  data: RentalItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = rentalSchema.parse(data);
    await setDocument("rentals", id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update rental" };
  }
}

export async function deleteRental(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDocument("rentals", id);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete rental" };
  }
}

export async function getRentalsSettingsAdmin(): Promise<RentalsSettings> {
  return getSiteDoc<RentalsSettings>("rentals-settings");
}

export async function updateRentalsSettings(
  data: RentalsSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSiteDoc("rentals-settings", data as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
