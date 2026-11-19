import { LayoutDashboard } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Customer Overview — WedPlan" };

export default function CustomerOverviewPage() {
  return (
    <PlaceholderPage
      title="Overview"
      subtitle="Track your wedding planning progress."
      icon={LayoutDashboard}
      description="Your booking stats and recent requests will appear here."
    />
  );
}
