"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { FormStatus } from "@/components/admin/form-status";
import { getProjectAdmin, updateProject } from "../actions";
import type { ProjectItem } from "@/lib/types";

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const data = await getProjectAdmin(id);
      if (!data) {
        setNotFound(true);
      } else {
        setProject(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading project..." />;
  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl">
        <FormStatus type="error" message={`Project "${id}" not found`} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">
          Edit Project
        </h1>
        <p className="mt-1 text-sm text-muted">{project?.title}</p>
      </div>
      <ProjectForm
        initial={project!}
        onSubmit={(data) => updateProject(id, data)}
        submitLabel="Save Changes"
      />
    </div>
  );
}
