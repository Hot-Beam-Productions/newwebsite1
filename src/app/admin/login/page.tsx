"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_DOMAIN, useAuth } from "@/components/admin/auth-provider";
import { LoadingSpinner } from "@/components/admin/loading-spinner";
import { AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/admin");
    }
  }, [loading, user, router]);

  if (loading) return <LoadingSpinner />;
  if (user) return <LoadingSpinner message="Redirecting..." />;

  async function handleSignIn() {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      if (message.includes("popup-closed")) {
        setError(null);
      } else {
        setError(message);
      }
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-surface p-8">
        <div className="text-center">
          <h1 className="font-heading text-2xl tracking-wide text-foreground">
            HBP Admin
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in with your Hot Beam Google account
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="flex w-full items-center justify-center gap-3 rounded-md bg-laser-cyan px-4 py-3 font-mono text-sm font-semibold text-background transition-all hover:brightness-110 disabled:opacity-50"
        >
          {signingIn ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {signingIn ? "Signing in..." : "Sign in with Google"}
        </button>

        <p className="text-center text-xs text-muted">
          Only @{ADMIN_DOMAIN} accounts are allowed
        </p>
      </div>
    </div>
  );
}
