import { Store } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "My Services — WedPlan" };

export default function MyServicesPage() {
  return (
    <PlaceholderPage
      title="My Services"
      subtitle="Create, edit and manage your service listings."
      icon={Store}
      description="Your service listings with availability toggles will appear here."
    />
  );
}
