import { ProfileSettings } from "@/components/shared/ProfileSettings";

export const metadata = { title: "Profile Settings — WedPlan" };

export default function AdminProfilePage() {
  return <ProfileSettings role="admin" />;
}
