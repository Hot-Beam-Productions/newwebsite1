"use client";

import { PageEditor } from "@/components/admin/page-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { getAboutAdmin, updateAbout } from "./actions";
import type { AboutData, TeamMember } from "@/lib/types";
import { Plus, X } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none";
const labelClass = "block text-sm font-medium text-muted-light mb-1.5";
const sectionClass = "space-y-4 rounded-lg border border-border bg-surface/50 p-5";

function TeamMemberEditor({
  members,
  onChange,
  label,
}: {
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  label: string;
}) {
  function updateMember(index: number, field: keyof TeamMember, value: string) {
    const next = [...members];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function addMember() {
    onChange([
      ...members,
      { id: `member-${Date.now()}`, name: "", role: "", bio: "", imageUrl: "" },
    ]);
  }

  function removeMember(index: number) {
    onChange(members.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-light">{label}</label>
        <button
          type="button"
          onClick={addMember}
          className="flex items-center gap-1 text-sm text-muted hover:text-laser-cyan"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {members.map((member, i) => (
        <div key={member.id} className="relative rounded-md border border-border p-4">
          <button
            type="button"
            onClick={() => removeMember(i)}
            className="absolute right-2 top-2 text-muted hover:text-red-400"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input className={inputClass} value={member.name} onChange={(e) => updateMember(i, "name", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Role</label>
              <input className={inputClass} value={member.role} onChange={(e) => updateMember(i, "role", e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <label className={labelClass}>Bio</label>
            <textarea className={inputClass} rows={2} value={member.bio ?? ""} onChange={(e) => updateMember(i, "bio", e.target.value)} />
          </div>
          <div className="mt-3">
            <ImageUploader
              value={member.imageUrl}
              onChange={(url) => updateMember(i, "imageUrl", url)}
              folder="team"
              label="Photo"
              aspect="square"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutEditorPage() {
  return (
    <PageEditor<AboutData>
      title="About Page"
      description="Edit company story, team, stats, and values"
      loadData={getAboutAdmin}
      saveData={updateAbout}
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
            {/* Heading */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Page Heading</h2>
              <div>
                <label className={labelClass}>Label</label>
                <input className={inputClass} value={data.heading.label} onChange={(e) => update("heading.label", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input className={inputClass} value={data.heading.title} onChange={(e) => update("heading.title", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input className={inputClass} value={data.heading.subtitle} onChange={(e) => update("heading.subtitle", e.target.value)} />
              </div>
            </div>

            {/* Story */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Story</h2>
              <div>
                <label className={labelClass}>Story Title</label>
                <input className={inputClass} value={data.storyTitle} onChange={(e) => update("storyTitle", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Story Paragraphs</label>
                <textarea
                  className={inputClass}
                  rows={8}
                  value={data.story.join("\n\n")}
                  onChange={(e) => update("story", e.target.value.split("\n\n").filter(Boolean))}
                  placeholder="Separate paragraphs with blank lines..."
                />
              </div>
            </div>

            {/* Stats */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Stats</h2>
              {data.stats.map((stat, i) => (
                <div key={i} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Value</label>
                    <input
                      className={inputClass}
                      value={stat.value}
                      onChange={(e) => {
                        const next = [...data.stats];
                        next[i] = { ...next[i], value: e.target.value };
                        update("stats", next);
                      }}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Label</label>
                    <input
                      className={inputClass}
                      value={stat.label}
                      onChange={(e) => {
                        const next = [...data.stats];
                        next[i] = { ...next[i], label: e.target.value };
                        update("stats", next);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Values */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Values</h2>
              {data.values.map((val, i) => (
                <div key={i} className="space-y-2">
                  <input
                    className={inputClass}
                    value={val.title}
                    placeholder="Value title"
                    onChange={(e) => {
                      const next = [...data.values];
                      next[i] = { ...next[i], title: e.target.value };
                      update("values", next);
                    }}
                  />
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={val.description}
                    placeholder="Value description"
                    onChange={(e) => {
                      const next = [...data.values];
                      next[i] = { ...next[i], description: e.target.value };
                      update("values", next);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Partners */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Partners</h2>
              <TeamMemberEditor
                members={data.partners}
                onChange={(val) => update("partners", val)}
                label=""
              />
            </div>

            {/* Crew */}
            <div className={sectionClass}>
              <h2 className="font-heading text-lg text-foreground">Crew</h2>
              <TeamMemberEditor
                members={data.crew}
                onChange={(val) => update("crew", val)}
                label=""
              />
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
            </div>
          </div>
        );
      }}
    />
  );
}
