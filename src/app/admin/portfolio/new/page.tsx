"use client";

import { ProjectForm } from "@/components/admin/project-form";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";
import { createProject } from "../actions";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Portfolio", href: "/admin/portfolio" },
          { label: "New Project" },
        ]}
      />
      <div>
        <h1 className="font-heading text-3xl tracking-wide text-foreground">
          New Project
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add a new production to your portfolio
        </p>
      </div>
      <ProjectForm
        onSubmit={(data) => createProject(data)}
        submitLabel="Create Project"
      />
    </div>
  );
}
