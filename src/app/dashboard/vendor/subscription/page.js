import { CreditCard } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Subscription — WedPlan" };

export default function SubscriptionPage() {
  return (
    <PlaceholderPage
      title="Subscription"
      subtitle="Upgrade to Premium for unlimited services and promotion."
      icon={CreditCard}
      description="Your current plan and Stripe checkout will appear here."
    />
  );
}
