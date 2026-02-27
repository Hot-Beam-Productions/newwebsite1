import {
  getSiteDoc,
  updateSiteDoc,
  getCollectionDocs,
  getDocById,
  setDocument,
  deleteDocument,
  docExists,
} from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { rentalSchema, rentalsSettingsSchema } from "@/lib/schemas";
import type { RentalItem, RentalsSettings } from "@/lib/types";

export async function getRentalsAdmin(): Promise<RentalItem[]> {
  return getCollectionDocs<RentalItem>("rentals");
}

export async function getRentalAdmin(id: string): Promise<RentalItem | null> {
  return getDocById<RentalItem>("rentals", id);
}

export async function createRental(
  data: RentalItem
): Promise<ActionResult> {
  try {
    const parsed = rentalSchema.parse(data);
    if (await docExists("rentals", parsed.id)) {
      return { success: false, error: "A rental item with this ID already exists" };
    }
    await setDocument("rentals", parsed.id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to create rental");
  }
}

export async function updateRental(
  id: string,
  data: RentalItem
): Promise<ActionResult> {
  try {
    const parsed = rentalSchema.parse(data);
    await setDocument("rentals", id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to update rental");
  }
}

export async function deleteRental(
  id: string
): Promise<ActionResult> {
  try {
    await deleteDocument("rentals", id);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to delete rental");
  }
}

export async function getRentalsSettingsAdmin(): Promise<RentalsSettings> {
  return getSiteDoc<RentalsSettings>("rentals-settings");
}

export async function updateRentalsSettings(
  data: RentalsSettings
): Promise<ActionResult> {
  try {
    const parsed = rentalsSettingsSchema.parse(data);
    await updateSiteDoc("rentals-settings", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/rentals"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Save failed");
  }
}
