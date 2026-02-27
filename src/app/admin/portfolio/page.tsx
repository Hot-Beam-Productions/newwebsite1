"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { FormStatus } from "@/components/admin/form-status";
import { getProjectsAdmin, deleteProject } from "./actions";
import type { ProjectItem } from "@/lib/types";

export default function PortfolioListPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getProjectsAdmin();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteProject(deleteTarget.id);
    setDeleteTarget(null);
    if (result.success) {
      setStatus({ type: "success", message: `"${deleteTarget.title}" deleted` });
      load();
    } else {
      setStatus({ type: "error", message: result.error || "Delete failed" });
    }
  }

  if (loading) return <LoadingSpinner message="Loading projects..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl tracking-wide text-foreground">Portfolio</h1>
          <p className="mt-1 text-sm text-muted">{projects.length} projects</p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="flex items-center gap-2 rounded-md bg-laser-cyan px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {status && <FormStatus type={status.type} message={status.message} />}

      <div className="overflow-hidden rounded-lg border border-border">
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
            {projects.map((project) => {
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
                          <Image
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
