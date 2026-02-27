"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "./image-uploader";
import { GalleryManager } from "./gallery-manager";
import { FormStatus } from "./form-status";
import { useUnsavedWarning } from "./use-unsaved-warning";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";
import { useToast } from "./toast";
import type { ProjectItem, ServiceCategory } from "@/lib/types";

const SERVICE_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "lighting", label: "Lighting" },
  { value: "video", label: "Video" },
  { value: "lasers", label: "Lasers" },
  { value: "sfx", label: "SFX" },
];

interface ProjectFormProps {
  initial?: ProjectItem;
  onSubmit: (data: ProjectItem) => Promise<{ success: boolean; error?: string }>;
  submitLabel: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProjectForm({ initial, onSubmit, submitLabel }: ProjectFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { addToast } = useToast();
  const initialSnapshotValue = JSON.stringify({
    id: initial?.id ?? "",
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    client: initial?.client ?? "",
    location: initial?.location ?? "",
    eventDate: initial?.eventDate ?? "",
    services: initial?.services ?? [],
    description: initial?.description ?? "",
    longDescription: initial?.longDescription ?? "",
    mainImageUrl: initial?.mainImageUrl ?? "",
    gallery: initial?.gallery ?? [],
    featured: initial?.featured ?? false,
    order: initial?.order ?? 0,
  });
  const [initialSnapshot, setInitialSnapshot] = useState(initialSnapshotValue);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [client, setClient] = useState(initial?.client ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [eventDate, setEventDate] = useState(initial?.eventDate ?? "");
  const [services, setServices] = useState<ServiceCategory[]>(initial?.services ?? []);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [longDescription, setLongDescription] = useState(initial?.longDescription ?? "");
  const [mainImageUrl, setMainImageUrl] = useState(initial?.mainImageUrl ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [order, setOrder] = useState(initial?.order ?? 0);

  const [autoSlug, setAutoSlug] = useState(!initial);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (autoSlug) setSlug(slugify(val));
  }

  function toggleService(svc: ServiceCategory) {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  }

  const currentData = useMemo<ProjectItem>(
    () => ({
      id: initial?.id ?? slugify(title),
      slug,
      title,
      client,
      location,
      eventDate,
      services,
      description,
      longDescription,
      mainImageUrl,
      gallery,
      featured,
      order,
    }),
    [
      client,
      description,
      eventDate,
      featured,
      gallery,
      initial?.id,
      location,
      longDescription,
      mainImageUrl,
      order,
      services,
      slug,
      title,
    ]
  );

  const isDirty = useMemo(
    () => JSON.stringify(currentData) !== initialSnapshot,
    [currentData, initialSnapshot]
  );

  useUnsavedWarning(isDirty);

  useKeyboardShortcut(
    "s",
    (event) => {
      event.preventDefault();
      formRef.current?.requestSubmit();
    },
    { meta: true, disabled: saving }
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError(null);
    try {
      const result = await onSubmit(currentData);

      if (result.success) {
        const serializedCurrentData = JSON.stringify(currentData);
        setInitialSnapshot(serializedCurrentData);
        addToast("success", "Saved successfully");
        setTimeout(() => router.push("/admin/portfolio"), 1000);
      } else {
        setError(result.error || "Save failed");
      }
    } catch {
      setError("Save failed");
    }

    setSaving(false);
  }

  const inputClass =
    "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
  const labelClass = "block text-sm font-medium text-muted-light mb-1.5";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && <FormStatus type="error" message={error} />}

      {/* Title & Slug */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className={inputClass}
            placeholder="Red Rocks Amphitheatre"
          />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            required
            pattern="^[a-z0-9-]+$"
            className={inputClass}
            placeholder="red-rocks-amphitheatre"
          />
        </div>
      </div>

      {/* Client, Location, Date */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Client</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            required
            className={inputClass}
            placeholder="Live Nation"
          />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className={inputClass}
            placeholder="Morrison, CO"
          />
        </div>
        <div>
          <label className={labelClass}>Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Services */}
      <div>
        <label className={labelClass}>Services</label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_OPTIONS.map((svc) => (
            <button
              key={svc.value}
              type="button"
              onClick={() => toggleService(svc.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                services.includes(svc.value)
                  ? "border-laser-cyan bg-laser-cyan/10 text-laser-cyan"
                  : "border-border text-muted hover:border-border-bright"
              }`}
            >
              {svc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Short Description */}
      <div>
        <label className={labelClass}>Short Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={2}
          className={inputClass}
          placeholder="Brief description shown in the portfolio grid..."
        />
      </div>

      {/* Long Description */}
      <div>
        <label className={labelClass}>Full Description</label>
        <textarea
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          required
          rows={6}
          className={inputClass}
          placeholder="Detailed write-up shown on the project detail page..."
        />
      </div>

      {/* Main Image */}
      <ImageUploader
        value={mainImageUrl}
        onChange={setMainImageUrl}
        folder="portfolio"
        label="Main Image"
      />

      {/* Gallery */}
      <GalleryManager
        value={gallery}
        onChange={setGallery}
        folder="portfolio"
      />

      {/* Featured & Order */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-muted-light">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-surface accent-laser-cyan"
          />
          Featured on homepage
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-light">Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            min={0}
            className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground focus:border-laser-cyan focus:outline-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => router.push("/admin/portfolio")}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted-light transition-colors hover:bg-surface-light"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="relative rounded-md bg-laser-cyan px-6 py-2 text-sm font-semibold text-background transition-all hover:brightness-110 disabled:opacity-50"
        >
          {isDirty && (
            <span
              aria-hidden
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-laser-cyan ring-2 ring-background"
            />
          )}
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
