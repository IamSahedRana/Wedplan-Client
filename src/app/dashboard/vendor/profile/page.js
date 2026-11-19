import { UserCog } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Profile Settings — WedPlan" };

export default function VendorProfilePage() {
  return (
    <PlaceholderPage
      title="Profile Settings"
      subtitle="Update your name, contact and business details."
      icon={UserCog}
      description="The profile edit form will appear here."
    />
  );
}
