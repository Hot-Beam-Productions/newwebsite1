import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import type { ContactData } from "@/lib/types";

export async function getContactAdmin(): Promise<ContactData> {
  return getSiteDoc<ContactData>("contact");
}

export async function updateContact(
  data: ContactData
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSiteDoc("contact", data as unknown as Record<string, unknown>);
    await revalidatePaths(["/contact"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
