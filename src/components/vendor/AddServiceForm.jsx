"use client";

import { FilePlus2, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ServiceForm } from "@/components/vendor/ServiceForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { FREE_SERVICE_LIMIT } from "@/lib/constants";

export function AddServiceForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [checkError, setCheckError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/vendor/stats")
      .then((stats) => {
        if (stats.plan !== "premium" && (stats.activeServices || 0) >= FREE_SERVICE_LIMIT) {
          setLimitReached(true);
        }
      })
      .catch((err) => setCheckError(err.message || "Failed to check your plan"))
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      await api.post("/services", values);
      toast.success("Service submitted as Pending — it will appear after admin approval");
      router.push("/dashboard/vendor/my-services");
    } catch (err) {
      if (/maximum of 3|free plan/i.test(err.message || "")) {
        setLimitReached(true);
        toast.error(err.message);
      } else {
        toast.error(err.message || "Could not create service");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (checkError) {
    return <ErrorState title="Couldn't load your plan" message={checkError} onRetry={() => window.location.reload()} />;
  }

  if (limitReached) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add Service</h1>
        <EmptyState
          icon={Sparkles}
          title="Service limit reached"
          description={`Your free plan allows ${FREE_SERVICE_LIMIT} active services, and you've reached the limit. Upgrade to Premium for unlimited services.`}
          action={
            <Button asChild className="rounded-full">
              <Link href="/dashboard/vendor/subscription">Upgrade to Premium</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Add Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish a new service for couples planning their big day.
        </p>
      </div>

      <Card className="flex items-start gap-3 border-info/30 bg-accent/40 p-4">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="text-sm text-secondary-foreground">
          <p className="font-medium text-foreground">Submitted as Pending</p>
          <p>
            New services are reviewed by our admin team before going live. Your listing will not be
            visible to customers until it is approved.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
            <FilePlus2 className="size-4" />
          </span>
          <h2 className="font-semibold text-foreground">Service details</h2>
        </div>
        <ServiceForm submitLabel="Submit for Approval" submitting={submitting} onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
