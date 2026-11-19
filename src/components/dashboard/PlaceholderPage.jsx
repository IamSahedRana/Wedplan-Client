import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

/** Temporary section placeholder until the module is built. */
export function PlaceholderPage({ title, subtitle, icon, description }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />
      <EmptyState icon={icon} title="Coming soon" description={description} />
    </div>
  );
}
