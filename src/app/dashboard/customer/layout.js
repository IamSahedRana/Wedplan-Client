import { Suspense } from "react";
import { headers } from "next/headers";

import { AccessDenied } from "@/components/dashboard/AccessDenied";
import { getAuth } from "@/lib/auth";
import { dashboardPathFor } from "@/lib/redirect";

async function CustomerRoleGuard({ children }) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (session?.user && session.user.role !== "customer") {
    return <AccessDenied ownDashboard={dashboardPathFor(session.user.role)} />;
  }
  return children;
}

export default function CustomerRoleLayout({ children }) {
  return (
    <Suspense fallback={null}>
      <CustomerRoleGuard>{children}</CustomerRoleGuard>
    </Suspense>
  );
}
