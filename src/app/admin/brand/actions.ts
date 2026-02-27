import { getSiteDoc, createBatch, batchSet } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import type { BrandData, NavLink, SeoData, FooterData } from "@/lib/types";

export interface BrandPageData {
  brand: BrandData;
  navigation: NavLink[];
  seo: SeoData;
  footer: FooterData;
}

export async function getBrandAdmin(): Promise<BrandPageData> {
  const [brand, navData, seo, footer] = await Promise.all([
    getSiteDoc<BrandData>("brand"),
    getSiteDoc<{ links?: NavLink[] }>("navigation"),
    getSiteDoc<SeoData>("seo"),
    getSiteDoc<FooterData>("footer"),
  ]);
  return {
    brand,
    navigation: navData?.links ?? [],
    seo,
    footer,
  };
}

export async function updateBrand(
  data: BrandPageData
): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = createBatch();
    batchSet(batch, "site", "brand", data.brand as unknown as Record<string, unknown>);
    batchSet(batch, "site", "navigation", { links: data.navigation });
    batchSet(batch, "site", "seo", data.seo as unknown as Record<string, unknown>);
    batchSet(batch, "site", "footer", data.footer as unknown as Record<string, unknown>);
    await batch.commit();
    await revalidatePaths(["/"]);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Save failed",
    };
  }
}
