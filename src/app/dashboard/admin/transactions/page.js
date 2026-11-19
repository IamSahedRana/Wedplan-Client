import { ReceiptText } from "lucide-react";

import { PlaceholderPage } from "@/components/dashboard/PlaceholderPage";

export const metadata = { title: "Transactions — WedPlan" };

export default function TransactionsPage() {
  return (
    <PlaceholderPage
      title="Transactions"
      subtitle="View subscription payments (read-only)."
      icon={ReceiptText}
      description="The transactions table will appear here."
    />
  );
}
