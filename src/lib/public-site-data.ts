import rawData from "@/data/data.json";
import { unstable_cache } from "next/cache";
import type {
  AboutData,
  BrandData,
  ContactData,
  FooterData,
  NavLink,
  ProjectItem,
  RentalsSettings,
  RentalItem,
  SeoData,
  SiteData,
  HomeData,
} from "@/lib/types";
import {
  aboutSchema,
  brandSchema,
  contactSchema,
  footerSchema,
  homeSchema,
  navigationSchema,
  projectSchema,
  rentalSchema,
  rentalsSettingsSchema,
  seoSchema,
} from "@/lib/schemas";

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { bytesValue: string }
  | { referenceValue: string }
  | { geoPointValue: { latitude: number; longitude: number } }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

interface FirestoreCollectionResponse {
  documents?: FirestoreDocument[];
  nextPageToken?: string;
}

const fallbackSiteData = rawData as SiteData;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.FIREBASE_PROJECT_ID;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? process.env.FIREBASE_API_KEY;
const PUBLIC_DATA_REVALIDATE_SECONDS = 30 * 60;
const PUBLIC_CACHE_TAG = "public-site-data";

function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if ("bytesValue" in value) return value.bytesValue;
  if ("referenceValue" in value) return value.referenceValue;
  if ("geoPointValue" in value) return value.geoPointValue;
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map((item) => decodeFirestoreValue(item));
  }
  if ("mapValue" in value) {
    return decodeFirestoreFields(value.mapValue.fields ?? {});
  }
  return null;
}

function decodeFirestoreFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function decodeFirestoreDocument<T>(doc: FirestoreDocument): T {
  const id = doc.name.split("/").pop() ?? "";
  const decoded = decodeFirestoreFields(doc.fields ?? {});
  return { id, ...decoded } as T;
}

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function mergeCollectionWithFallback<T extends { id: string; order?: number }>(
  fallbackItems: T[],
  cmsItems: T[] | null
): T[] {
  if (!cmsItems) return fallbackItems;

  const mergedItems = new Map<string, T>();

  for (const item of fallbackItems) {
    mergedItems.set(item.id, item);
  }

  for (const item of cmsItems) {
    mergedItems.set(item.id, item);
  }

  return sortByOrder(Array.from(mergedItems.values()));
}

function parseOrNull<T>(result: { success: boolean; data?: T }): T | null {
  return result.success ? (result.data as T) : null;
}

async function fetchFirestoreJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: {
        revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
        tags: [PUBLIC_CACHE_TAG],
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getSiteDoc<T>(docId: string): Promise<T | null> {
  if (!projectId || !apiKey) return null;
  const encodedDocId = encodeURIComponent(docId);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/site/${encodedDocId}?key=${apiKey}`;
  const doc = await fetchFirestoreJson<FirestoreDocument>(url);
  if (!doc) return null;
  return decodeFirestoreFields(doc.fields ?? {}) as T;
}

async function getCollectionDocs<T>(collectionName: string): Promise<T[] | null> {
  if (!projectId || !apiKey) return null;

  let nextPageToken: string | undefined;
  const docs: T[] = [];

  do {
    const query = new URLSearchParams({
      key: apiKey,
      pageSize: "100",
      ...(nextPageToken ? { pageToken: nextPageToken } : {}),
    });
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?${query.toString()}`;
    const data = await fetchFirestoreJson<FirestoreCollectionResponse>(url);
    if (!data) return null;

    docs.push(...(data.documents ?? []).map((doc) => decodeFirestoreDocument<T>(doc)));
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return docs;
}

async function loadBrandData(): Promise<BrandData> {
  const brandDoc = await getSiteDoc<BrandData>("brand");
  return parseOrNull(brandSchema.safeParse(brandDoc)) ?? fallbackSiteData.brand;
}

async function loadNavigationData(): Promise<NavLink[]> {
  const navigationDoc = await getSiteDoc<{ links?: NavLink[] }>("navigation");
  return parseOrNull(navigationSchema.safeParse({ links: navigationDoc?.links ?? [] }))?.links ?? fallbackSiteData.navigation;
}

async function loadSeoData(): Promise<SeoData> {
  const seoDoc = await getSiteDoc<SeoData>("seo");
  return parseOrNull(seoSchema.safeParse(seoDoc)) ?? fallbackSiteData.seo;
}

async function loadHomeData(): Promise<HomeData> {
  const homeDoc = await getSiteDoc<HomeData>("home");
  return parseOrNull(homeSchema.safeParse(homeDoc)) ?? fallbackSiteData.home;
}

async function loadAboutData(): Promise<AboutData> {
  const aboutDoc = await getSiteDoc<AboutData>("about");
  return parseOrNull(aboutSchema.safeParse(aboutDoc)) ?? fallbackSiteData.about;
}

async function loadContactData(): Promise<ContactData> {
  const contactDoc = await getSiteDoc<ContactData>("contact");
  return parseOrNull(contactSchema.safeParse(contactDoc)) ?? fallbackSiteData.contact;
}

async function loadFooterData(): Promise<FooterData> {
  const footerDoc = await getSiteDoc<FooterData>("footer");
  return parseOrNull(footerSchema.safeParse(footerDoc)) ?? fallbackSiteData.footer;
}

async function loadWorkData(): Promise<SiteData["work"]> {
  const projectsDocs = await getCollectionDocs<ProjectItem>("projects");
  const projects = mergeCollectionWithFallback(fallbackSiteData.work.projects, projectsDocs);
  const parsedProjects = projects
    .map((project) => parseOrNull(projectSchema.safeParse(project)))
    .filter((project): project is ProjectItem => Boolean(project));

  return {
    ...fallbackSiteData.work,
    projects: parsedProjects.length > 0 ? parsedProjects : fallbackSiteData.work.projects,
  };
}

async function loadRentalsData(): Promise<SiteData["rentals"]> {
  const [rentalsSettingsDoc, rentalsDocs] = await Promise.all([
    getSiteDoc<RentalsSettings>("rentals-settings"),
    getCollectionDocs<RentalItem>("rentals"),
  ]);

  const rentals = mergeCollectionWithFallback(fallbackSiteData.rentals.items, rentalsDocs);
  const parsedRentalsSettings = parseOrNull(rentalsSettingsSchema.safeParse(rentalsSettingsDoc));
  const parsedRentals = rentals
    .map((rental) => parseOrNull(rentalSchema.safeParse(rental)))
    .filter((rental): rental is RentalItem => Boolean(rental));

  return {
    ...fallbackSiteData.rentals,
    ...(parsedRentalsSettings ?? {}),
    items: parsedRentals.length > 0 ? parsedRentals : fallbackSiteData.rentals.items,
  };
}

async function loadPublicSiteData(): Promise<SiteData> {
  const [brand, navigation, seo, home, about, contact, footer, work, rentals] = await Promise.all([
    loadBrandData(),
    loadNavigationData(),
    loadSeoData(),
    loadHomeData(),
    loadAboutData(),
    loadContactData(),
    loadFooterData(),
    loadWorkData(),
    loadRentalsData(),
  ]);

  return {
    ...fallbackSiteData,
    brand,
    navigation,
    seo,
    home,
    about,
    contact,
    footer,
    work,
    rentals,
  };
}

async function loadPublicShellData(): Promise<Pick<SiteData, "brand" | "navigation" | "footer">> {
  const [brand, navigation, footer] = await Promise.all([loadBrandData(), loadNavigationData(), loadFooterData()]);
  return { brand, navigation, footer };
}

async function loadPublicBrandData(): Promise<Pick<SiteData, "brand">> {
  const brand = await loadBrandData();
  return { brand };
}

async function loadPublicBrandSeoData(): Promise<Pick<SiteData, "brand" | "seo">> {
  const [brand, seo] = await Promise.all([loadBrandData(), loadSeoData()]);
  return { brand, seo };
}

async function loadPublicNavigationData(): Promise<Pick<SiteData, "navigation">> {
  const navigation = await loadNavigationData();
  return { navigation };
}

async function loadPublicHomePageData(): Promise<Pick<SiteData, "brand" | "home" | "work">> {
  const [brand, home, work] = await Promise.all([loadBrandData(), loadHomeData(), loadWorkData()]);
  return { brand, home, work };
}

async function loadPublicWorkPageData(): Promise<Pick<SiteData, "work">> {
  const work = await loadWorkData();
  return { work };
}

async function loadPublicRentalsPageData(): Promise<Pick<SiteData, "rentals">> {
  const rentals = await loadRentalsData();
  return { rentals };
}

async function loadPublicAboutPageData(): Promise<Pick<SiteData, "about">> {
  const about = await loadAboutData();
  return { about };
}

async function loadPublicContactPageData(): Promise<Pick<SiteData, "brand" | "contact">> {
  const [brand, contact] = await Promise.all([loadBrandData(), loadContactData()]);
  return { brand, contact };
}

async function loadPublicSitemapData(): Promise<Pick<SiteData, "brand" | "navigation" | "work" | "rentals">> {
  const [brand, navigation, work, rentals] = await Promise.all([
    loadBrandData(),
    loadNavigationData(),
    loadWorkData(),
    loadRentalsData(),
  ]);
  return { brand, navigation, work, rentals };
}

export const getPublicSiteData = unstable_cache(loadPublicSiteData, ["public-site-data-full"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicShellData = unstable_cache(loadPublicShellData, ["public-shell-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicBrandData = unstable_cache(loadPublicBrandData, ["public-brand-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicBrandSeoData = unstable_cache(loadPublicBrandSeoData, ["public-brand-seo-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicNavigationData = unstable_cache(loadPublicNavigationData, ["public-navigation-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicHomePageData = unstable_cache(loadPublicHomePageData, ["public-home-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicWorkData = unstable_cache(loadPublicWorkPageData, ["public-work-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicRentalsData = unstable_cache(loadPublicRentalsPageData, ["public-rentals-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicAboutData = unstable_cache(loadPublicAboutPageData, ["public-about-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicContactData = unstable_cache(loadPublicContactPageData, ["public-contact-page-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});

export const getPublicSitemapData = unstable_cache(loadPublicSitemapData, ["public-sitemap-data"], {
  revalidate: PUBLIC_DATA_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAG],
});
