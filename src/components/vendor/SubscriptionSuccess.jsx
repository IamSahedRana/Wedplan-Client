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

const POLL_INTERVAL = 2000;
const MAX_ATTEMPTS = 30;

export function SubscriptionSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState(() =>
    sessionId
      ? { status: "verifying", error: null, result: null }
      : { status: "error", error: "Missing session reference.", result: null }
  );
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let timer;
    let attempts = 0;

    async function poll() {
      try {
        const result = await api.get(`/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        if (cancelled) return;

        if (result.status === "paid") {
          setState({ status: "paid", error: null, result });
          invalidateToken();
          try {
            await authClient.getSession();
          } catch {
            // Access is already granted in Mongo; a stale client session is harmless.
          }
          router.refresh();
          return;
        }

        if (result.paymentStatus === "paid") {
          setState({
            status: "verifying",
            error: null,
            result: { ...result, message: "Payment received — activating lifetime Pro access…" },
          });
        } else if (result.paymentStatus === "unpaid" || result.status === "failed") {
          setState({ status: "error", error: "The payment was not completed.", result });
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setState({ status: "error", error: err.message || "Could not verify your payment", result: null });
        return;
      }

      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        if (!cancelled) {
          setState({
            status: "error",
            error: "Activation is taking longer than expected. Please check your subscription page shortly.",
            result: null,
          });
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

  if (state.status === "paid") {
    const { result } = state;
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="flex flex-col items-center gap-5 border-premium/30 bg-premium-tint/20 p-10 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-premium-tint text-premium">
            <Crown className="size-8" />
          </span>
          <PremiumBadge className="px-3 py-1 text-xs">Pro</PremiumBadge>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Payment confirmed!</h1>
            <p className="mt-2 text-sm text-secondary-foreground">
              Your one-time payment is complete. Lifetime Pro access is active with unlimited
              listings, featured placement and priority support.
            </p>
          </div>
          <dl className="w-full space-y-2 rounded-2xl bg-white/70 p-4 text-left text-xs sm:text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-semibold text-foreground">Pro</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Timeline</dt>
              <dd className="font-semibold text-foreground">UNLIMITED</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Subscription ID</dt>
              <dd className="max-w-[65%] truncate font-mono text-foreground">{result?.subscriptionId || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Transaction ID</dt>
              <dd className="max-w-[65%] truncate font-mono text-foreground">{result?.transactionId || "—"}</dd>
            </div>
          </dl>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link href="/dashboard/vendor">
                Go to dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
              <Link href="/dashboard/vendor/subscription">View subscription</Link>
            </Button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="size-4" /> A receipt has been recorded in your transaction history.
          </p>
        </Card>
      </div>
    );
  }

  if (state.status === "verifying") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <LoaderCircle className="size-10 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">
            {state.result?.message ? "Activating Pro access…" : "Verifying your payment…"}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {state.result?.message ||
              "This usually takes a few seconds. Please keep this page open while we confirm your payment."}
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
          {state.error || "Your payment status is still pending. You can check again shortly."}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {sessionId && (
            <Button
              className="w-full rounded-full sm:w-auto"
              onClick={() => {
                setState({ status: "verifying", error: null, result: null });
                setRetryKey((n) => n + 1);
              }}
            >
              <RotateCw className="size-4" /> Try again
            </Button>
          )}
          <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
            <Link href="/dashboard/vendor/subscription">Back to subscription</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
