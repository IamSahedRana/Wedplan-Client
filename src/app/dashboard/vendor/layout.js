import { Suspense } from "react";
import { headers } from "next/headers";

import { AccessDenied } from "@/components/dashboard/AccessDenied";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SessionUnavailable } from "@/components/dashboard/SessionUnavailable";
import { dashboardPathFor } from "@/lib/redirect";
import { getSafeSession } from "@/lib/session";

async function VendorRoleGuard({ children }) {
  const { session, error } = await getSafeSession(await headers());
  if (error) return <SessionUnavailable />;
  if (session?.user && session.user.role !== "vendor") {
    return <AccessDenied ownDashboard={dashboardPathFor(session.user.role)} />;
  }
  return children;
}

export default function VendorRoleLayout({ children }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <VendorRoleGuard>{children}</VendorRoleGuard>
    </Suspense>
  );
}
