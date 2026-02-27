import {
  getCollectionDocs,
  getDocById,
  setDocument,
  deleteDocument,
  docExists,
} from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { projectSchema } from "@/lib/schemas";
import type { ProjectItem } from "@/lib/types";

export async function getProjectsAdmin(): Promise<ProjectItem[]> {
  return getCollectionDocs<ProjectItem>("projects");
}

export async function getProjectAdmin(id: string): Promise<ProjectItem | null> {
  return getDocById<ProjectItem>("projects", id);
}

export async function createProject(
  data: ProjectItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = projectSchema.parse(data);

    if (await docExists("projects", parsed.id)) {
      return { success: false, error: "A project with this ID already exists" };
    }

    await setDocument("projects", parsed.id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/work", "/"]);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create project",
    };
  }
}

export async function updateProject(
  id: string,
  data: ProjectItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = projectSchema.parse(data);
    await setDocument("projects", id, parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/work", "/"]);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update project",
    };
  }
}

export async function deleteProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDocument("projects", id);
    await revalidatePaths(["/work", "/"]);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete project",
    };
  }
}
