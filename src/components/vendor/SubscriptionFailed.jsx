"use client";

import { ArrowRight, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function SubscriptionFailed() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-warning-tint text-warning">
          <TriangleAlert className="size-7" />
        </span>
        <h1 className="text-2xl font-bold sm:text-3xl">Payment canceled</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your Pro upgrade was not completed. No charge was made, and your current plan is
          unchanged. You can try again whenever you&apos;re ready.
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link href="/dashboard/vendor/subscription">
              <RotateCcw className="size-4" /> Try Again
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href="/dashboard/vendor">
              Go to dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
