"use client";

import { PageEditor } from "@/components/admin/page-editor";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { getRentalsSettingsAdmin, updateRentalsSettings } from "../actions";
import type { RentalsSettings } from "@/lib/types";
import { Plus, X } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/50 p-5";

export default function RentalsSettingsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Rentals", href: "/admin/rentals" },
          { label: "Settings" },
        ]}
      />
      <PageEditor<RentalsSettings>
        title="Rentals Settings"
        description="Page heading, categories, and footer note"
        loadData={getRentalsSettingsAdmin}
        saveData={updateRentalsSettings}
        renderForm={(data, setData) => (
          <div className="space-y-6">
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Page Heading</h2>
              <div>
                <label className={labelClass}>Label</label>
                <input className={inputClass} value={data.heading.label} onChange={(e) => setData({ ...data, heading: { ...data.heading, label: e.target.value } })} />
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={data.heading.title} onChange={(e) => setData({ ...data, heading: { ...data.heading, title: e.target.value } })} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input className={inputClass} value={data.heading.subtitle} onChange={(e) => setData({ ...data, heading: { ...data.heading, subtitle: e.target.value } })} />
              </div>
            </div>

            <div className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-foreground">Categories</h2>
                <button
                  type="button"
                  onClick={() => setData({ ...data, categories: [...data.categories, { value: "", label: "" }] })}
                  className="flex items-center gap-1 text-sm text-muted hover:text-laser-cyan"
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              {data.categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    className={`${inputClass} flex-1`}
                    value={cat.value}
                    placeholder="Value (e.g. lighting)"
                    onChange={(e) => {
                      const next = [...data.categories];
                      next[i] = { ...next[i], value: e.target.value };
                      setData({ ...data, categories: next });
                    }}
                  />
                  <input
                    className={`${inputClass} flex-1`}
                    value={cat.label}
                    placeholder="Label (e.g. Lighting)"
                    onChange={(e) => {
                      const next = [...data.categories];
                      next[i] = { ...next[i], label: e.target.value };
                      setData({ ...data, categories: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setData({ ...data, categories: data.categories.filter((_, j) => j !== i) })}
                    className="text-muted hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Footer Note</h2>
              <textarea
                className={inputClass}
                rows={3}
                value={data.footerNote}
                onChange={(e) => setData({ ...data, footerNote: e.target.value })}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}
