import { Inbox } from "lucide-react";

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-12 text-center ${className || ""}`}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <Icon className="size-6" />
      </span>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
