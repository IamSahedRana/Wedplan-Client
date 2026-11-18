import { Suspense } from "react";

import { ServiceDetail } from "@/components/services/ServiceDetail";

export const metadata = { title: "Service Details — WedPlan" };

export default function ServiceDetailPage() {
  return (
    <Suspense>
      <ServiceDetail />
    </Suspense>
  );
}
