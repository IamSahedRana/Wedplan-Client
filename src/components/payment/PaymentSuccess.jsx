"use client";

import { ArrowRight, CheckCircle2, Crown, LoaderCircle, RotateCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api, invalidateToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";

const POLL_INTERVAL = 2000;
const MAX_ATTEMPTS = 30;

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();
  const [status, setStatus] = useState("verifying");
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Missing session reference. Please return to your subscription page and try again.");
      return;
    }

    let cancelled = false;
    let timer;
    let attempts = 0;

    async function poll() {
      try {
        const data = await api.get(`/payments/session/${encodeURIComponent(sessionId)}`);
        if (cancelled) return;

        if (data.status === "paid") {
          setTransaction(data.transaction);
          setStatus("paid");
          invalidateToken();
          try {
            await authClient.getSession();
          } catch {
            // Payment is confirmed even if the local session refresh fails.
          }
          router.refresh();
          return;
        }

        if (data.status === "failed") {
          setStatus("error");
          setError("The payment was not completed. Please try again.");
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err.message || "Could not verify your payment");
        return;
      }

      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        if (!cancelled) {
          setStatus("error");
          setError("Verification is taking longer than expected. Please try again.");
        }
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL);
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId, router, retryKey]);

  function retry() {
    setStatus("verifying");
    setError(null);
    setTransaction(null);
    setRetryKey((n) => n + 1);
  }

  if (status === "verifying") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <LoaderCircle className="size-10 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Verifying your payment…</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            This usually takes a few seconds. Please keep this page open while we confirm your
            subscription.
          </p>
        </Card>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="flex flex-col items-center gap-5 border-premium/30 bg-premium-tint/20 p-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-premium-tint text-premium">
            <Crown className="size-8" />
          </span>
          <PremiumBadge className="px-3 py-1 text-xs" />
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Payment confirmed!</h1>
            <p className="mt-2 text-sm text-secondary-foreground">
              Welcome to WedPlan Premium. Your subscription is active
              {transaction?.subscriptionExpiresAt
                ? ` until ${formatDate(transaction.subscriptionExpiresAt)}`
                : ""}
              . You can now list unlimited services.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link href="/dashboard/vendor/subscription">
                View subscription <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
              <Link href="/dashboard/vendor">Go to dashboard</Link>
            </Button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="size-4" /> A receipt has been recorded in your transaction history.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-error-tint text-error">
          <TriangleAlert className="size-7" />
        </span>
        <h1 className="text-2xl font-bold">We couldn&apos;t confirm this payment</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error || "Your payment status is still pending. You can check again shortly."}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {sessionId && (
            <Button className="w-full rounded-full sm:w-auto" onClick={retry}>
              <RotateCw className="size-4" /> Try again
            </Button>
          )}
          <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href="/dashboard/vendor/subscription">Back to subscription</Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href="/dashboard/vendor">Go to dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
