import {
  getCollectionDocs,
  getDocById,
  setDocument,
  deleteDocument,
  docExists,
} from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { projectSchema } from "@/lib/schemas";
import type { ProjectItem, SiteData } from "@/lib/types";
import rawData from "@/data/data.json";

const fallbackSiteData = rawData as SiteData;

function sortByOrder<T extends { order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function mergeWithFallback<T extends { id: string; order?: number }>(
  fallbackItems: T[],
  cmsItems: T[]
): T[] {
  const mergedItems = new Map<string, T>();

  for (const item of fallbackItems) {
    mergedItems.set(item.id, item);
  }

  for (const item of cmsItems) {
    mergedItems.set(item.id, item);
  }

  return sortByOrder(Array.from(mergedItems.values()));
}

export async function getProjectsAdmin(): Promise<ProjectItem[]> {
  const cmsProjects = await getCollectionDocs<ProjectItem>("projects");
  return mergeWithFallback(fallbackSiteData.work.projects, cmsProjects);
}

export async function getProjectAdmin(id: string): Promise<ProjectItem | null> {
  const cmsProject = await getDocById<ProjectItem>("projects", id);
  if (cmsProject) return cmsProject;

  return fallbackSiteData.work.projects.find((project) => project.id === id) ?? null;
}

export async function createProject(
  data: ProjectItem
): Promise<ActionResult> {
  try {
    const parsed = projectSchema.parse(data);

    const existsInCms = await docExists("projects", parsed.id);
    const existsInFallback = fallbackSiteData.work.projects.some((project) => project.id === parsed.id);
    if (existsInCms || existsInFallback) {
      return { success: false, error: "A project with this ID already exists" };
    }

    await setDocument("projects", parsed.id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/work", "/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to create project");
  }
}

export async function updateProject(
  id: string,
  data: ProjectItem
): Promise<ActionResult> {
  try {
    const parsed = projectSchema.parse(data);
    await setDocument("projects", id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/work", "/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to update project");
  }
}

export async function deleteProject(
  id: string
): Promise<ActionResult> {
  try {
    const existsInCms = await docExists("projects", id);
    if (!existsInCms) {
      const existsInFallback = fallbackSiteData.work.projects.some((project) => project.id === id);
      if (existsInFallback) {
        return {
          success: false,
          error:
            "This project comes from fallback seed data. Remove it from src/data/data.json or overwrite it in admin first.",
        };
      }
    }

    await deleteDocument("projects", id);
    await revalidatePaths(["/work", "/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to delete project");
  }
}
