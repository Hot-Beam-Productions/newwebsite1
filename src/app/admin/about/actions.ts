import { getSiteDoc, updateSiteDoc } from "@/lib/firestore-client";
import { revalidatePaths } from "@/lib/admin-action";
import { actionError, type ActionResult } from "@/lib/action-result";
import { aboutSchema } from "@/lib/schemas";
import type { AboutData } from "@/lib/types";

export async function getAboutAdmin(): Promise<AboutData> {
  return getSiteDoc<AboutData>("about");
}

export async function updateAbout(
  data: AboutData
): Promise<ActionResult> {
  try {
    const parsed = aboutSchema.parse(data);
    await updateSiteDoc("about", parsed as unknown as Record<string, unknown>);
    await revalidatePaths(["/about"]);
    return { success: true };
  } catch (err) {
    return actionError(err, "Save failed");
  }
}
