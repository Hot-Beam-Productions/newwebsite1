import rawData from "@/data/data.json";
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

async function fetchFirestoreJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
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

export async function getPublicSiteData(): Promise<SiteData> {
  const [
    brandDoc,
    navigationDoc,
    seoDoc,
    homeDoc,
    aboutDoc,
    contactDoc,
    footerDoc,
    rentalsSettingsDoc,
    projectsDocs,
    rentalsDocs,
  ] = await Promise.all([
    getSiteDoc<BrandData>("brand"),
    getSiteDoc<{ links?: NavLink[] }>("navigation"),
    getSiteDoc<SeoData>("seo"),
    getSiteDoc<HomeData>("home"),
    getSiteDoc<AboutData>("about"),
    getSiteDoc<ContactData>("contact"),
    getSiteDoc<FooterData>("footer"),
    getSiteDoc<RentalsSettings>("rentals-settings"),
    getCollectionDocs<ProjectItem>("projects"),
    getCollectionDocs<RentalItem>("rentals"),
  ]);

  const projects = projectsDocs ? sortByOrder(projectsDocs) : fallbackSiteData.work.projects;
  const rentals = rentalsDocs ? sortByOrder(rentalsDocs) : fallbackSiteData.rentals.items;

  return {
    ...fallbackSiteData,
    brand: brandDoc ?? fallbackSiteData.brand,
    navigation: navigationDoc?.links ?? fallbackSiteData.navigation,
    seo: seoDoc ?? fallbackSiteData.seo,
    home: homeDoc ?? fallbackSiteData.home,
    about: aboutDoc ?? fallbackSiteData.about,
    contact: contactDoc ?? fallbackSiteData.contact,
    footer: footerDoc ?? fallbackSiteData.footer,
    work: {
      ...fallbackSiteData.work,
      projects,
    },
    rentals: {
      ...fallbackSiteData.rentals,
      ...(rentalsSettingsDoc ?? {}),
      items: rentals,
    },
  };
}
