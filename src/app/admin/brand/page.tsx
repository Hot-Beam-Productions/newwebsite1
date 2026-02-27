"use client";

import { PageEditor } from "@/components/admin/page-editor";
import { ArrayEditor } from "@/components/admin/array-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { getBrandAdmin, updateBrand, type BrandPageData } from "./actions";
import { Plus, X } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/50 p-5";

export default function BrandEditorPage() {
  return (
    <PageEditor<BrandPageData>
      title="Brand & Footer"
      description="Company info, navigation, SEO, and footer"
      loadData={getBrandAdmin}
      saveData={updateBrand}
      renderForm={(data, setData) => {
        function updateBrandField(field: string, value: string) {
          setData({
            ...data,
            brand: { ...data.brand, [field]: value },
          });
        }

        return (
          <div className="space-y-6">
            {/* Brand Info */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Brand</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input className={inputClass} value={data.brand.name} onChange={(e) => updateBrandField("name", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Short Name</label>
                  <input className={inputClass} value={data.brand.shortName} onChange={(e) => updateBrandField("shortName", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone (Display)</label>
                  <input className={inputClass} value={data.brand.phoneDisplay} onChange={(e) => updateBrandField("phoneDisplay", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Phone (Href)</label>
                  <input className={inputClass} value={data.brand.phoneHref} onChange={(e) => updateBrandField("phoneHref", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input className={inputClass} value={data.brand.email} onChange={(e) => updateBrandField("email", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Location</label>
                  <input className={inputClass} value={data.brand.location} onChange={(e) => updateBrandField("location", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Region</label>
                  <input className={inputClass} value={data.brand.region} onChange={(e) => updateBrandField("region", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Website URL</label>
                <input className={inputClass} value={data.brand.url} onChange={(e) => updateBrandField("url", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Instagram Handle</label>
                  <input className={inputClass} value={data.brand.instagramHandle} onChange={(e) => updateBrandField("instagramHandle", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Instagram URL</label>
                  <input className={inputClass} value={data.brand.instagramUrl} onChange={(e) => updateBrandField("instagramUrl", e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Value Proposition</label>
                <textarea className={inputClass} rows={2} value={data.brand.valueProposition} onChange={(e) => updateBrandField("valueProposition", e.target.value)} />
              </div>
              <ImageUploader
                value={data.brand.heroLogo}
                onChange={(url) => updateBrandField("heroLogo", url)}
                folder="brand"
                label="Hero Logo"
                aspect="square"
              />
            </div>

            {/* Navigation */}
            <div className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg text-foreground">Navigation</h2>
                <button
                  type="button"
                  onClick={() =>
                    setData({
                      ...data,
                      navigation: [...data.navigation, { href: "/", label: "New Link" }],
                    })
                  }
                  className="flex items-center gap-1 text-sm text-muted hover:text-laser-cyan"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Link
                </button>
              </div>
              {data.navigation.map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    className={`${inputClass} flex-1`}
                    value={link.label}
                    placeholder="Label"
                    onChange={(e) => {
                      const next = [...data.navigation];
                      next[i] = { ...next[i], label: e.target.value };
                      setData({ ...data, navigation: next });
                    }}
                  />
                  <input
                    className={`${inputClass} flex-1`}
                    value={link.href}
                    placeholder="/path"
                    onChange={(e) => {
                      const next = [...data.navigation];
                      next[i] = { ...next[i], href: e.target.value };
                      setData({ ...data, navigation: next });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setData({
                        ...data,
                        navigation: data.navigation.filter((_, j) => j !== i),
                      })
                    }
                    className="text-muted hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* SEO */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">SEO</h2>
              <div>
                <label className={labelClass}>Default Title</label>
                <input
                  className={inputClass}
                  value={data.seo.defaultTitle}
                  onChange={(e) => setData({ ...data, seo: { ...data.seo, defaultTitle: e.target.value } })}
                />
              </div>
              <div>
                <label className={labelClass}>Title Template</label>
                <input
                  className={inputClass}
                  value={data.seo.titleTemplate}
                  onChange={(e) => setData({ ...data, seo: { ...data.seo, titleTemplate: e.target.value } })}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={data.seo.description}
                  onChange={(e) => setData({ ...data, seo: { ...data.seo, description: e.target.value } })}
                />
              </div>
              <ArrayEditor
                label="Keywords"
                value={data.seo.keywords}
                onChange={(val) => setData({ ...data, seo: { ...data.seo, keywords: val } })}
                placeholder="Keyword..."
              />
            </div>

            {/* Footer */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Footer</h2>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={data.footer.description}
                  onChange={(e) => setData({ ...data, footer: { ...data.footer, description: e.target.value } })}
                />
              </div>
              <ArrayEditor
                label="Departments"
                value={data.footer.departments}
                onChange={(val) => setData({ ...data, footer: { ...data.footer, departments: val } })}
                placeholder="Department name..."
              />
            </div>
          </div>
        );
      }}
    />
  );
}
