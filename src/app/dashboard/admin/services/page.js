import { PackageSearch } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Manage Services — WedPlan" };

export default function ManageServicesPage() {
  return (
    <PlaceholderPage
      title="Manage Services"
      subtitle="Approve or reject vendor service submissions."
      icon={PackageSearch}
      description="The service moderation queue will appear here."
    />
  );
}
