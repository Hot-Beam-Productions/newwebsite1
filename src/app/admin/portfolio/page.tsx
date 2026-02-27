"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Film, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FormStatus } from "@/components/admin/form-status";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/components/admin/toast";
import { getProjectsAdmin, deleteProject } from "./actions";
import type { ProjectItem } from "@/lib/types";

export default function PortfolioListPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();

  const refreshProjects = useCallback(async () => {
    const data = await getProjectsAdmin();
    setProjects(data);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      try {
        const data = await getProjectsAdmin();
        if (!active) return;
        setProjects(data);
      } catch {
        if (!active) return;
        setError("Failed to load projects");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProjects();

    return () => {
      active = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) => {
      return (
        project.title.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term)
      );
    });
  }, [projects, searchQuery]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    if (result.success) {
      addToast("success", `"${deleteTarget.title}" deleted`);
      void refreshProjects();
    } else {
      setError(result.error || "Delete failed");
    }
  }

  if (loading) return <LoadingSpinner message="Loading projects..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">Portfolio</h1>
          <p className="mt-1 text-sm text-muted">
            {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="flex items-center gap-2 rounded-md bg-laser-cyan px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {error && <FormStatus type="error" message={error} />}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by title or client..."
          className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-laser-cyan focus:outline-none"
        />
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No projects yet"
          description="Create your first project to populate the portfolio."
          actionLabel="Add Project"
          actionHref="/admin/portfolio/new"
        />
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface/50 p-8 text-center text-sm text-muted">
          No projects match your search.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredProjects.map((project) => {
              const hasImage =
                project.mainImageUrl && !project.mainImageUrl.includes("pub-XXXX");
              return (
                <div key={project.id} className="rounded-lg border border-border bg-surface/60 p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-border">
                      {hasImage ? (
                        <CmsImage src={project.mainImageUrl} alt={project.title} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-surface text-xs text-muted">--</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{project.title}</p>
                      <p className="text-xs text-muted">{project.client}</p>
                      <p className="text-xs text-muted">{project.eventDate}</p>
                      {project.featured && (
                        <span className="mt-1 inline-flex rounded-full bg-laser-cyan/10 px-2 py-0.5 text-xs text-laser-cyan">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Link
                      href={`/admin/portfolio/${project.id}`}
                      className="rounded p-1.5 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(project)}
                      className="rounded p-1.5 text-muted-light transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const hasImage =
                    project.mainImageUrl && !project.mainImageUrl.includes("pub-XXXX");
                  return (
                    <tr
                      key={project.id}
                      className="border-b border-border transition-colors hover:bg-surface/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded border border-border">
                            {hasImage ? (
                              <CmsImage
                                src={project.mainImageUrl}
                                alt={project.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-surface text-xs text-muted">
                                --
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-foreground">{project.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-light">{project.client}</td>
                      <td className="px-4 py-3 text-muted-light">{project.eventDate}</td>
                      <td className="px-4 py-3">
                        {project.featured && (
                          <span className="rounded-full bg-laser-cyan/10 px-2 py-0.5 text-xs text-laser-cyan">
                            Featured
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/portfolio/${project.id}`}
                            className="rounded p-1.5 text-muted-light transition-colors hover:bg-surface-light hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(project)}
                            className="rounded p-1.5 text-muted-light transition-colors hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
