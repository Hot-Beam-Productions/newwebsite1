import type { MetadataRoute } from "next";
import { getPublicSiteData } from "@/lib/public-site-data";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const {
    brand: { url },
  } = await getPublicSiteData();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${url}/sitemap.xml`,
  };
}
