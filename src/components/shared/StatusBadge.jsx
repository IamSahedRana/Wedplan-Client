import { Badge } from "@/components/ui/badge";

const STATUS_STYLES = {
  pending: "bg-warning-tint text-warning",
  accepted: "bg-success-tint text-success",
  approved: "bg-success-tint text-success",
  active: "bg-success-tint text-success",
  rejected: "bg-error-tint text-error",
  cancelled: "bg-muted text-muted-foreground",
  premium: "bg-premium-tint text-premium",
};

export function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[String(status).toLowerCase()] || "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={`border-transparent ${style} ${className || ""}`}>
      {String(status)}
    </Badge>
  );
}
