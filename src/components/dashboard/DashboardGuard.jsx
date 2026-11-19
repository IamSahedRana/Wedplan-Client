import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { BlockedMessage } from "@/components/dashboard/AccessDenied";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getAuth } from "@/lib/auth";

/** Async server guard: session check, blocked check, then the role-aware shell. */
export async function DashboardGuard({ children }) {
  const session = await getAuth().api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin?redirect=/dashboard");
  }
  if (session.user.isBlocked) {
    return <BlockedMessage />;
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
