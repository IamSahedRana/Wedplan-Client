import { CalendarCheck } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "My Bookings — WedPlan" };

export default function MyBookingsPage() {
  return (
    <PlaceholderPage
      title="My Bookings"
      subtitle="View and manage your booking requests."
      icon={CalendarCheck}
      description="Your bookings with status and cancel actions will appear here."
    />
  );
}
