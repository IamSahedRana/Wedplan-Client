import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SessionUnavailable } from "@/components/dashboard/SessionUnavailable";
import { dashboardPathFor } from "@/lib/redirect";
import { getSafeSession } from "@/lib/session";

async function DashboardRedirect() {
  const { session, error } = await getSafeSession(await headers());

  if (error) return <SessionUnavailable />;
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
