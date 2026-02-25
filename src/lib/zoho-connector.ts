/**
 * Zoho CRM Connector — Service Layer
 *
 * Currently reads from local JSON files.
 * Structured as async service for seamless Zoho API swap.
 */

import inventoryData from "@/data/inventory.json";
import projectsData from "@/data/projects.json";

// Types

export interface InventoryItem {
  id: string;
  name: string;
  model: string;
  category: string;
  brand: string;
  wattage: number | null;
  weight: string;
  dailyRate: number;
  specs: string[];
  description: string;
  available: boolean;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  date: string;
  services: string[];
  description: string;
  featured: boolean;
  slug: string;
}

export interface QuoteLead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  eventDate: string;
  venue?: string;
  eventType: string;
  gearNeeds: string[];
  message?: string;
  estimatedBudget?: string;
}

// --- Inventory ---

export async function getInventory(): Promise<InventoryItem[]> {
  // TODO: Replace with Zoho Inventory API call
  // GET https://inventory.zoho.com/api/v1/items
  return inventoryData as InventoryItem[];
}

export async function getInventoryByCategory(
  category: string
): Promise<InventoryItem[]> {
  const items = await getInventory();
  if (category === "all") return items;
  return items.filter((item) => item.category === category);
}

export async function getInventoryItem(
  id: string
): Promise<InventoryItem | undefined> {
  const items = await getInventory();
  return items.find((item) => item.id === id);
}

// --- Projects ---

export async function getProjects(): Promise<Project[]> {
  // TODO: Replace with Zoho CRM API or keep as static data
  return projectsData as Project[];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await getProjects();
  return projects.filter((p) => p.featured);
}

export async function getProjectBySlug(
  slug: string
): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug);
}

// --- Quote / Lead Submission ---

export async function submitQuoteLead(
  lead: QuoteLead
): Promise<{ success: boolean; data: QuoteLead }> {
  // TODO: Replace with Zoho CRM Web-to-Lead POST
  // POST https://www.zohoapis.com/crm/v2/Leads
  // Headers: { Authorization: "Zoho-oauthtoken {token}" }

  const payload = {
    ...lead,
    source: "Website — Quote Form",
    submittedAt: new Date().toISOString(),
  };

  console.log("[Zoho CRM] Lead payload:", JSON.stringify(payload, null, 2));

  return { success: true, data: lead };
}
