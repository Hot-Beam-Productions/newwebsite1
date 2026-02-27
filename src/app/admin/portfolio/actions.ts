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
import type { ProjectItem } from "@/lib/types";

export async function getProjectsAdmin(): Promise<ProjectItem[]> {
  return getCollectionDocs<ProjectItem>("projects");
}

export async function getProjectAdmin(id: string): Promise<ProjectItem | null> {
  return getDocById<ProjectItem>("projects", id);
}

export async function createProject(
  data: ProjectItem
): Promise<ActionResult> {
  try {
    const parsed = projectSchema.parse(data);

    if (await docExists("projects", parsed.id)) {
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
    await deleteDocument("projects", id);
    await revalidatePaths(["/work", "/"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Failed to delete project");
  }
}
