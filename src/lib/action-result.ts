export interface ActionResult {
  success: boolean;
  error?: string;
}

export function actionError(err: unknown, fallback = "Action failed"): ActionResult {
  return {
    success: false,
    error: err instanceof Error ? err.message : fallback,
  };
}
