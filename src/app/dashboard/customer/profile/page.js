import { UserCog } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Profile Settings — WedPlan" };

export default function CustomerProfilePage() {
  return (
    <PlaceholderPage
      title="Profile Settings"
      subtitle="Update your name, contact and address."
      icon={UserCog}
      description="The profile edit form will appear here."
    />
  );
}
