"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

interface FormStatusProps {
  type: "success" | "error";
  message: string;
}

export function FormStatus({ type, message }: FormStatusProps) {
  if (type === "success") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-sm text-emerald-300">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3">
      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
      <p className="text-sm text-red-300">{message}</p>
    </div>
  );
}
