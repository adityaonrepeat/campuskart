"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center text-muted-foreground">
      <AlertCircle className="h-12 w-12 opacity-40" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">Something went wrong</p>
        <p className="text-sm">
          This page failed to load. This is usually temporary — please try again.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
      {error.digest && (
        <p className="text-[11px] opacity-60">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
