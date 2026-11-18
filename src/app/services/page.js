import { Suspense } from "react";

import { ServicesBrowser } from "@/components/services/ServicesBrowser";

export const metadata = { title: "Browse Services — WedPlan" };

export default function ServicesPage() {
  return (
    <Suspense>
      <ServicesBrowser />
    </Suspense>
  );
}
