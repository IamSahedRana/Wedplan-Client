import { ArrowRight, CircleX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Payment cancelled — WedPlan" };

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleX className="size-7" />
        </span>
        <h1 className="text-2xl font-bold">Payment cancelled</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You weren&apos;t charged. Your current plan is unchanged — you can return to the
          subscription page whenever you&apos;re ready.
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link href="/dashboard/vendor/subscription">
              Back to subscription <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href="/dashboard/vendor">Go to dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
