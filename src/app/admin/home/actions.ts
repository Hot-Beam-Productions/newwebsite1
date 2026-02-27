import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import type { HomeData } from "@/lib/types";

export async function getHomeAdmin(): Promise<HomeData> {
  return getSiteDoc<HomeData>("home");
}

export async function updateHome(
  data: HomeData
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSiteDoc("home", data as unknown as Record<string, unknown>);
    await revalidatePaths(["/"]);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
