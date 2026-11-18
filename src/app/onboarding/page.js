import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/auth/OnboardingForm";
import { getAuth } from "@/lib/auth";
import { dashboardPathFor } from "@/lib/redirect";

export const metadata = { title: "Onboarding — WedPlan" };

async function OnboardingContent() {
  const session = await getAuth().api.getSession({ headers: await headers() });

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
