"use client";

import { PageEditor } from "@/components/admin/page-editor";
import { ArrayEditor } from "@/components/admin/array-editor";
import { getHomeAdmin, updateHome } from "./actions";
import type { HomeData } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/50 p-5";

export default function HomeEditorPage() {
  return (
    <PageEditor<HomeData>
      title="Home Page"
      description="Edit hero content, trust signals, stats, and CTAs"
      loadData={getHomeAdmin}
      saveData={updateHome}
      renderForm={(data, setData) => {
        function update(path: string, value: unknown) {
          const next = structuredClone(data);
          const keys = path.split(".");
          let obj: Record<string, unknown> = next as unknown as Record<string, unknown>;
          for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]] as Record<string, unknown>;
          }
          obj[keys[keys.length - 1]] = value;
          setData(next);
        }

        return (
          <div className="space-y-6">
            {/* Hero */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Hero Section</h2>
              <div>
                <label className={labelClass}>Eyebrow</label>
                <input className={inputClass} value={data.hero.eyebrow} onChange={(e) => update("hero.eyebrow", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Headline</label>
                <input className={inputClass} value={data.hero.headline} onChange={(e) => update("hero.headline", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Subheadline</label>
                <input className={inputClass} value={data.hero.subheadline} onChange={(e) => update("hero.subheadline", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Department Line</label>
                <input className={inputClass} value={data.hero.departmentLine} onChange={(e) => update("hero.departmentLine", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={inputClass} rows={3} value={data.hero.description} onChange={(e) => update("hero.description", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Primary CTA Label</label>
                  <input className={inputClass} value={data.hero.primaryCta.label} onChange={(e) => update("hero.primaryCta.label", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Primary CTA Link</label>
                  <input className={inputClass} value={data.hero.primaryCta.href} onChange={(e) => update("hero.primaryCta.href", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Secondary CTA Label</label>
                  <input className={inputClass} value={data.hero.secondaryCta.label} onChange={(e) => update("hero.secondaryCta.label", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Secondary CTA Link</label>
                  <input className={inputClass} value={data.hero.secondaryCta.href} onChange={(e) => update("hero.secondaryCta.href", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Trust Signals</h2>
              <ArrayEditor
                label=""
                value={data.trustSignals}
                onChange={(val) => update("trustSignals", val)}
                placeholder="Trust signal text..."
              />
            </div>

            {/* Results / Stats */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Stats</h2>
              {data.results.map((stat, i) => (
                <div key={i} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Value</label>
                    <input
                      className={inputClass}
                      value={stat.value}
                      onChange={(e) => {
                        const next = [...data.results];
                        next[i] = { ...next[i], value: e.target.value };
                        update("results", next);
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Label</label>
                    <input
                      className={inputClass}
                      value={stat.label}
                      onChange={(e) => {
                        const next = [...data.results];
                        next[i] = { ...next[i], label: e.target.value };
                        update("results", next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Closing CTA */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Closing CTA</h2>
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={data.closingCta.title} onChange={(e) => update("closingCta.title", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea className={inputClass} rows={2} value={data.closingCta.description} onChange={(e) => update("closingCta.description", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Button Label</label>
                  <input className={inputClass} value={data.closingCta.button.label} onChange={(e) => update("closingCta.button.label", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Button Link</label>
                  <input className={inputClass} value={data.closingCta.button.href} onChange={(e) => update("closingCta.button.href", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
