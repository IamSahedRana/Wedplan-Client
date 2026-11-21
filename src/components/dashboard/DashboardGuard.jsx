import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { BlockedMessage } from "@/components/dashboard/AccessDenied";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SessionUnavailable } from "@/components/dashboard/SessionUnavailable";
import { getSafeSession } from "@/lib/session";

/** Async server guard: session check, blocked check, then the role-aware shell. */
export async function DashboardGuard({ children }) {
  const requestHeaders = await headers();
  const currentPath = requestHeaders.get("x-wedplan-path") || "/dashboard";
  const { session, error } = await getSafeSession(requestHeaders);

  if (error) return <SessionUnavailable />;
  if (!session?.user) {
    redirect(`/signin?redirect=${encodeURIComponent(currentPath)}`);
  }
  if (session.user.isBlocked) {
    return <BlockedMessage />;
  }
  if (!session.user.onboarded) {
    redirect("/onboarding");
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
