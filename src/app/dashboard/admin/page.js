import { LayoutDashboard } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Admin Overview — WedPlan" };

export default function AdminOverviewPage() {
  return (
    <PlaceholderPage
      title="Overview"
      subtitle="Platform-wide stats and activity."
      icon={LayoutDashboard}
      description="User, service and transaction summaries will appear here."
    />
  );
}
