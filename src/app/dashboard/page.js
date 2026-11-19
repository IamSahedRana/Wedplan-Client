import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { getAuth } from "@/lib/auth";
import { dashboardPathFor } from "@/lib/redirect";

async function DashboardRedirect() {
  const session = await getAuth().api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/signin?redirect=/dashboard");
  }
  if (!session.user.onboarded) {
    redirect("/onboarding");
  }

  redirect(dashboardPathFor(session.user.role));
}

export default function DashboardRedirectPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardRedirect />
    </Suspense>
  );
}
