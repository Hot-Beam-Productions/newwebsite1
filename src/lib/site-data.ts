/**
 * Site data access layer.
 *
 * Public pages read from the static JSON file for fast builds.
 * The admin panel reads/writes Firestore via src/lib/firestore.ts.
 * After admin edits, the Firestore data takes effect on the next revalidation.
 */
import rawData from "@/data/data.json";

// Re-export all types from the shared types module
export type {
  ServiceCategory,
  ServiceIcon,
  NavLink,
  Cta,
  BrandData,
  SeoData,
  HomeService,
  ProjectItem,
  RentalItem,
  TeamMember,
  SiteData,
  HomeData,
  AboutData,
  ContactData,
  FooterData,
  SectionHeading,
  WorkSettings,
  RentalsSettings,
} from "./types";

import type { SiteData, ProjectItem, RentalItem } from "./types";

export const siteData = rawData as SiteData;

export const brand = siteData.brand;
export const navigation = siteData.navigation;
export const seo = siteData.seo;
export const home = siteData.home;
export const work = siteData.work;
export const about = siteData.about;
export const rentals = siteData.rentals;
export const contact = siteData.contact;
export const footer = siteData.footer;

export function getWorkProject(slug: string): ProjectItem | undefined {
  return work.projects.find((project) => project.slug === slug);
}

export function getRentalItem(id: string): RentalItem | undefined {
  return rentals.items.find((item) => item.id === id);
}
