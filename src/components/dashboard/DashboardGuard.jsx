import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { BlockedMessage } from "@/components/dashboard/AccessDenied";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAuth } from "@/lib/auth";

/** Async server guard: session check, blocked check, then the role-aware shell. */
export async function DashboardGuard({ children }) {
  const requestHeaders = await headers();
  const currentPath = requestHeaders.get("x-wedplan-path") || "/dashboard";
  const session = await getAuth().api.getSession({ headers: requestHeaders });

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
