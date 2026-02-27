import type { MetadataRoute } from "next";
import { getPublicSiteData } from "@/lib/public-site-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const {
    brand: { url },
    navigation,
    work,
    rentals,
  } = await getPublicSiteData();

  const baseRoutes = navigation
    .map((item) => item.href)
    .map((href) => {
      if (!href.startsWith("/")) {
        return null;
      }

      const route = href.split(/[?#]/)[0] || "/";

      return route.startsWith("/") ? route : null;
    })
    .filter((route): route is string => Boolean(route));
  const legalRoutes = ["/privacy-policy", "/terms-of-use", "/site-map"];

  const projectRoutes = work.projects.map((project) => `/work/${project.slug}`);
  const rentalRoutes = rentals.items.map((rental) => `/rentals/${rental.slug}`);

  const allRoutes = [...new Set(["/", ...baseRoutes, ...legalRoutes, ...projectRoutes, ...rentalRoutes])];

  const now = new Date();

  return allRoutes.map((route) => ({
    url: `${url}${route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
