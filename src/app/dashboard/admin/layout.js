import { Suspense } from "react";
import { headers } from "next/headers";

import { AccessDenied } from "@/components/dashboard/AccessDenied";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SessionUnavailable } from "@/components/dashboard/SessionUnavailable";
import { dashboardPathFor } from "@/lib/redirect";
import { getSafeSession } from "@/lib/session";

async function AdminRoleGuard({ children }) {
  const { session, error } = await getSafeSession(await headers());
  if (error) return <SessionUnavailable />;
  if (session?.user && session.user.role !== "admin") {
    return <AccessDenied ownDashboard={dashboardPathFor(session.user.role)} />;
  }
  return children;
}

export default function AdminRoleLayout({ children }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminRoleGuard>{children}</AdminRoleGuard>
    </Suspense>
  );
}
