import { CalendarClock } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Booking Requests — WedPlan" };

export default function VendorBookingsPage() {
  return (
    <PlaceholderPage
      title="Booking Requests"
      subtitle="Accept or reject incoming booking requests."
      icon={CalendarClock}
      description="Your booking requests with accept/reject actions will appear here."
    />
  );
}
