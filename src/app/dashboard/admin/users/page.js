import { Users } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Manage Users — WedPlan" };

export default function ManageUsersPage() {
  return (
    <PlaceholderPage
      title="Manage Users"
      subtitle="View, block and unblock platform users."
      icon={Users}
      description="The user management table will appear here."
    />
  );
}
