import { Suspense } from "react";

import { DashboardGuard } from "@/components/dashboard/DashboardGuard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardShell";

export const metadata = { title: "Dashboard — WedPlan" };

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardGuard>{children}</DashboardGuard>
    </Suspense>
  );
}
