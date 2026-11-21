"use client";

import { ErrorState } from "@/components/shared/ErrorState";

/** Friendly fallback for transient database/session errors on private routes. */
export function SessionUnavailable() {
  return (
    <div className="container-page py-16">
      <ErrorState
        title="Session temporarily unavailable"
        message="We couldn't verify your session right now. Please try again in a moment."
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}
