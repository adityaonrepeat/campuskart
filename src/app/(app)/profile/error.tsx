"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-6 flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <AlertCircle className="h-10 w-10 opacity-40" />
      <p className="text-sm font-medium text-foreground">Failed to load profile</p>
      <p className="text-xs">{error.message}</p>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
