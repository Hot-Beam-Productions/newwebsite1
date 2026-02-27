"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { FormStatus } from "./form-status";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { useToast } from "./toast";

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
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;
    const frame = window.requestAnimationFrame(() => {
      setLoading(true);
    });

    async function load() {
      try {
        const result = await loadData();
        if (!active) return;
        setData(result);
        const serializedResult = JSON.stringify(result);
        setOriginalData(serializedResult);
      } catch {
        if (!active) return;
        setError("Failed to load data");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
  }, [loadData]);

  const serializedData = useMemo(
    () => (data ? JSON.stringify(data) : null),
    [data]
  );

  const isDirty = useMemo(() => {
    if (!serializedData || !originalData) return false;
    return serializedData !== originalData;
  }, [serializedData, originalData]);

  useUnsavedWarning(isDirty);

  const handleSave = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const result = await saveData(data);
      if (result.success) {
        const serializedResult = JSON.stringify(data);
        setOriginalData(serializedResult);
        addToast("success", "Saved successfully");
      } else {
        setError(result.error || "Save failed");
      }
    } catch {
      setError("Save failed");
    }
    setSaving(false);
  }, [addToast, data, saveData]);

  useKeyboardShortcut(
    "s",
    (event) => {
      event.preventDefault();
      void handleSave();
    },
    {
      meta: true,
      disabled: !data || loading || saving,
    }
  );

  if (loading) return <LoadingSpinner message={`Loading ${title.toLowerCase()}...`} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      {error && <FormStatus type="error" message={error} />}

      {data && renderForm(data, setData)}

      <div className="flex justify-end border-t border-border pt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="relative rounded-md bg-laser-cyan px-6 py-2 text-sm font-semibold text-background transition-all hover:brightness-110 disabled:opacity-50"
        >
          {isDirty && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-laser-cyan ring-2 ring-background"
            />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
