import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { SessionUnavailable } from "@/components/dashboard/SessionUnavailable";
import { dashboardPathFor } from "@/lib/redirect";
import { getSafeSession } from "@/lib/session";

export const metadata = { title: "Onboarding — WedPlan" };

async function OnboardingContent() {
  const { session, error } = await getSafeSession(await headers());

  if (error) return <SessionUnavailable />;
  if (!session?.user) {
    redirect("/signin?redirect=/onboarding");
  }
  if (session.user.onboarded) {
    redirect(dashboardPathFor(session.user.role));
  }

  return <OnboardingForm user={session.user} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="container-page py-20" />}>
      <OnboardingContent />
    </Suspense>
  );
}
