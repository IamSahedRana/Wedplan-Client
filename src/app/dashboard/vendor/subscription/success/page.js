import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";

import { SubscriptionSuccess } from "@/components/vendor/SubscriptionSuccess";

export const metadata = { title: "Payment confirmed — WedPlan" };

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <SubscriptionSuccess />
    </Suspense>
  );
}
