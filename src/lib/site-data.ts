import rawData from "@/data/data.json";

export type ServiceCategory = "audio" | "lighting" | "video" | "lasers" | "sfx";
export type ServiceIcon = "volume" | "lightbulb" | "monitor" | "zap" | "sparkles";

export interface NavLink {
  href: string;
  label: string;
}

export interface Cta {
  label: string;
  href: string;
}

export interface BrandData {
  name: string;
  shortName: string;
  url: string;
  location: string;
  region: string;
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  heroLogo: string;
  valueProposition: string;
}

export interface SeoData {
  defaultTitle: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
}

export interface HomeService {
  id: ServiceCategory;
  icon: ServiceIcon;
  title: string;
  description: string;
  highlights: string[];
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  client: string;
  location: string;
  eventDate: string;
  services: ServiceCategory[];
  description: string;
  longDescription: string;
  mainImageUrl: string;
  gallery: string[];
  featured: boolean;
}

export interface RentalItem {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  brand: string;
  dailyRate: number | null;
  description: string;
  specs: string[];
  imageUrl: string;
  available: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  imageUrl: string;
}

export interface SiteData {
  brand: BrandData;
  navigation: NavLink[];
  seo: SeoData;
  home: {
    hero: {
      eyebrow: string;
      departmentLine: string;
      description: string;
      primaryCta: Cta;
      secondaryCta: Cta;
    };
    services: {
      label: string;
      title: string;
      subtitle: string;
      featuredServiceId: ServiceCategory;
      items: HomeService[];
    };
    results: Array<{
      label: string;
      value: string;
    }>;
    closingCta: {
      title: string;
      description: string;
      button: Cta;
    };
  };
  work: {
    heading: {
      label: string;
      title: string;
      subtitle: string;
    };
    projects: ProjectItem[];
  };
  about: {
    heading: {
      label: string;
      title: string;
      subtitle: string;
    };
    storyTitle: string;
    story: string[];
    stats: Array<{
      label: string;
      value: string;
    }>;
    values: Array<{
      title: string;
      description: string;
    }>;
    partners: TeamMember[];
    crew: TeamMember[];
    closingCta: {
      title: string;
      description: string;
      button: Cta;
    };
  };
  rentals: {
    heading: {
      label: string;
      title: string;
      subtitle: string;
    };
    categories: Array<{
      value: string;
      label: string;
    }>;
    footerNote: string;
    items: RentalItem[];
  };
  contact: {
    heading: {
      label: string;
      title: string;
      subtitle: string;
    };
    directContactTitle: string;
    cards: Array<{
      title: string;
      body: string;
    }>;
    eventTypes: string[];
    serviceNeeds: string[];
    success: {
      title: string;
      message: string;
    };
    submitLabel: string;
  };
  footer: {
    description: string;
    departments: string[];
  };
}

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
