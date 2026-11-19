import { ShieldX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AccessDenied({ ownDashboard }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-error-tint text-error">
        <ShieldX className="size-7" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Access denied</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        You don&apos;t have permission to view this dashboard section. It belongs to another role.
      </p>
      <Button asChild className="rounded-full">
        <Link href={ownDashboard || "/"}>Go to My Dashboard</Link>
      </Button>
    </div>
  );
}

export function BlockedMessage() {
  return (
    <div className="container-page flex min-h-screen flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-error-tint text-error">
        <ShieldX className="size-7" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Account blocked</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Your account has been blocked by an administrator. If you believe this is a mistake,
        please contact support.
      </p>
      <Button asChild variant="outline" className="rounded-full">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
