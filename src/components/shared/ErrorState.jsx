"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({ title = "Something went wrong", message, onRetry, className }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-error-tint/40 p-12 text-center ${className || ""}`}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-error-tint text-error">
        <TriangleAlert className="size-6" />
      </span>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {message && <p className="max-w-sm text-sm text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button variant="outline" className="rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
