/**
 * Thin server action helper — only handles path revalidation.
 * All Firestore reads/writes now happen client-side via firestore-client.ts.
 */
"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePaths(
  paths: string[]
): Promise<void> {
  for (const path of paths) {
    revalidatePath(path);
  }
}
