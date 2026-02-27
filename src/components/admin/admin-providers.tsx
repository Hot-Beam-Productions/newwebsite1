"use client";

import { AuthProvider } from "./auth-provider";
import { AdminGuard } from "./admin-guard";

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
