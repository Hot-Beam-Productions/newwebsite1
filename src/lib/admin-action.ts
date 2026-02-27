/**
 * Thin server action helper — only handles path revalidation.
 * All Firestore reads/writes now happen client-side via firestore-client.ts.
 */
"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { getPublicSiteDataFresh } from "@/lib/public-site-data";
import { publishSiteSnapshot } from "@/lib/published-site-snapshot";

export async function revalidatePaths(
  paths: string[]
): Promise<void> {
  for (const path of paths) {
    revalidatePath(path);
  }
  revalidateTag("public-site-data", "max");

  try {
    const siteData = await getPublicSiteDataFresh();
    const published = await publishSiteSnapshot(siteData);
    if (!published) {
      console.warn("Failed to publish public-site-data snapshot to R2");
    }
  } catch (error) {
    console.error("Snapshot publish failed after admin update", error);
  }
}
