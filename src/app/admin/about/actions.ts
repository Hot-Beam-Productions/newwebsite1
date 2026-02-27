import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import type { AboutData } from "@/lib/types";

export async function getAboutAdmin(): Promise<AboutData> {
  return getSiteDoc<AboutData>("about");
}

export async function updateAbout(
  data: AboutData
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSiteDoc("about", data as unknown as Record<string, unknown>);
    await revalidatePaths(["/about"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
