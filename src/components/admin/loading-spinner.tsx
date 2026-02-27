export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-laser-cyan" />
        <p className="text-sm text-muted">{message}</p>
      </div>
    </div>
  );
}
