import { LayoutDashboard } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Vendor Overview — WedPlan" };

export default function VendorOverviewPage() {
  return (
    <PlaceholderPage
      title="Overview"
      subtitle="Welcome back — here's your business at a glance."
      icon={LayoutDashboard}
      description="Your services, bookings and subscription stats will appear here."
    />
  );
}
