"use client";

import { AuthProvider } from "./auth-provider";
import { AdminGuard } from "./admin-guard";
import { ToastProvider } from "./toast";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminGuard>{children}</AdminGuard>
      </ToastProvider>
    </AuthProvider>
  );
}
