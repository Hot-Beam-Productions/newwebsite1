import { getSiteDoc, createBatch, batchSet } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { brandSchema, footerSchema, navigationSchema, seoSchema } from "@/lib/schemas";
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
): Promise<ActionResult> {
  try {
    const brand = brandSchema.parse(data.brand);
    const navigation = navigationSchema.parse({ links: data.navigation }).links;
    const seo = seoSchema.parse(data.seo);
    const footer = footerSchema.parse(data.footer);

    const batch = createBatch();
    batchSet(batch, "site", "brand", brand as unknown as Record<string, unknown>);
    batchSet(batch, "site", "navigation", { links: navigation });
    batchSet(batch, "site", "seo", seo as unknown as Record<string, unknown>);
    batchSet(batch, "site", "footer", footer as unknown as Record<string, unknown>);
    await batch.commit();
    await revalidatePaths(["/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Save failed");
  }
}
