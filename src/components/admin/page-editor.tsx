"use client";

import { useEffect, useState, useCallback } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { FormStatus } from "./form-status";

interface PageEditorProps<T> {
  title: string;
  description: string;
  loadData: () => Promise<T>;
  saveData: (data: T) => Promise<{ success: boolean; error?: string }>;
  renderForm: (data: T, setData: (data: T) => void) => React.ReactNode;
}

export function PageEditor<T>({
  title,
  description,
  loadData,
  saveData,
  renderForm,
}: PageEditorProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadData();
      setData(result);
    } catch {
      setStatus({ type: "error", message: "Failed to load data" });
    }
    setLoading(false);
  }, [loadData]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setStatus(null);
    const result = await saveData(data);
    if (result.success) {
      setStatus({ type: "success", message: "Saved successfully" });
    } else {
      setStatus({ type: "error", message: result.error || "Save failed" });
    }
    setSaving(false);
  }

  if (loading) return <LoadingSpinner message={`Loading ${title.toLowerCase()}...`} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      {status && <FormStatus type={status.type} message={status.message} />}

      {data && renderForm(data, setData)}

      <div className="flex justify-end border-t border-border pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-laser-cyan px-6 py-2 text-sm font-semibold text-background transition-all hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
