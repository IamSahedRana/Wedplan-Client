import { PlusCircle } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Add Service — WedPlan" };

export default function AddServicePage() {
  return (
    <PlaceholderPage
      title="Add Service"
      subtitle="Publish a new service for couples to discover."
      icon={PlusCircle}
      description="The service creation form will appear here (free plan: up to 3 active services)."
    />
  );
}
