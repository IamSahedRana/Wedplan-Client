import { LoaderCircle } from "lucide-react";
import { Suspense } from "react";

import { ManageServices } from "@/components/admin/ManageServices";

export const metadata = { title: "Manage Services — WedPlan" };

export default function ManageServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoaderCircle className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <ManageServices />
    </Suspense>
  );
}
