"use client";

import {
  Check,
  CreditCard,
  Crown,
  LoaderCircle,
  ReceiptText,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { FREE_SERVICE_LIMIT } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const PREMIUM_PRICE = 9.99;

function usd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function isPremiumActive(user) {
  return (
    user?.subscriptionPlan === "premium" &&
    !!user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt).getTime() > Date.now()
  );
}

function PaymentStatus({ status }) {
  const styles = {
    paid: "bg-success-tint text-success",
    pending: "bg-warning-tint text-warning",
    failed: "bg-error-tint text-error",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        styles[status] || "bg-muted text-muted-foreground"
      )}
    >
      {status || "unknown"}
    </span>
  );
}

export function Subscription() {
  const [profile, setProfile] = useState({ loading: true, error: null, user: null });
  const [transactions, setTransactions] = useState({ loading: true, error: null, items: [] });
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);

  const loadProfile = useCallback(() => {
    setProfile({ loading: true, error: null, user: null });
    api
      .get("/me")
      .then((data) => setProfile({ loading: false, error: null, user: data.user }))
      .catch((err) =>
        setProfile({ loading: false, error: err.message || "Failed to load your plan", user: null })
      );
  }, []);

  const loadTransactions = useCallback(() => {
    setTransactions({ loading: true, error: null, items: [] });
    api
      .get("/vendor/transactions")
      .then((data) => setTransactions({ loading: false, error: null, items: data.items || [] }))
      .catch((err) =>
        setTransactions({
          loading: false,
          error: err.message || "Failed to load transactions",
          items: [],
        })
      );
  }, []);

  useEffect(() => {
    loadProfile();
    loadTransactions();
  }, [loadProfile, loadTransactions]);

  async function upgrade() {
    setUpgradeLoading(true);
    try {
      const data = await api.post("/payments/checkout-session");
      if (!data?.url) throw new Error("Stripe did not return a checkout URL");
      toast.success("Redirecting to secure checkout…");
      window.location.assign(data.url);
    } catch (err) {
      toast.error(err.message || "Could not start checkout");
      setUpgradeLoading(false);
    }
  }

  async function cancel() {
    setCancelLoading(true);
    try {
      await api.post("/payments/cancel-subscription");
      setCancelAtPeriodEnd(true);
      setConfirmCancel(false);
      toast.success("Subscription cancellation scheduled");
    } catch (err) {
      toast.error(err.message || "Could not cancel subscription");
    } finally {
      setCancelLoading(false);
    }
  }

  if (profile.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (profile.error) {
    return <ErrorState title="Couldn't load your subscription" message={profile.error} onRetry={loadProfile} />;
  }

  const premium = isPremiumActive(profile.user);
  const expiry = profile.user?.subscriptionExpiresAt ? formatDate(profile.user.subscriptionExpiresAt) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subscription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your plan, billing and payment history.
        </p>
      </div>

      {/* Current plan */}
      <Card
        className={cn(
          "flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between",
          premium && "border-premium/30 bg-premium-tint/30"
        )}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              premium ? "bg-premium-tint text-premium" : "bg-accent text-primary"
            )}
          >
            {premium ? <Crown className="size-6" /> : <CreditCard className="size-6" />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Your current plan</h2>
              {premium && <PremiumBadge />}
            </div>
            <p className="mt-1 text-sm text-secondary-foreground">
              {premium ? (
                cancelAtPeriodEnd ? (
                  <>
                    Cancellation scheduled — Premium stays active and ends on <strong>{expiry}</strong>.
                  </>
                ) : (
                  <>Premium access is active until <strong>{expiry}</strong>. Enjoy unlimited service listings.</>
                )
              ) : (
                <>
                  Free plan — up to {FREE_SERVICE_LIMIT} active services. Upgrade any time for
                  unlimited listings and promotion.
                </>
              )}
            </p>
          </div>
        </div>
        {premium && !cancelAtPeriodEnd && (
          <Button
            variant="outline"
            className="w-full shrink-0 rounded-full sm:w-auto"
            onClick={() => setConfirmCancel(true)}
          >
            <X className="size-4" /> Cancel Subscription
          </Button>
        )}
      </Card>

      {/* Pricing cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Free</h3>
            {!premium && <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">Current plan</span>}
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {usd(0)} <span className="text-sm font-normal text-muted-foreground">/ forever</span>
          </p>
          <ul className="mt-5 flex-1 space-y-3 text-sm text-secondary-foreground">
            {[`Up to ${FREE_SERVICE_LIMIT} active services`, "Receive booking requests", "Basic profile listing"].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" /> {feature}
              </li>
            ))}
          </ul>
          {!premium && (
            <p className="mt-6 rounded-xl bg-muted/60 p-3 text-center text-xs text-muted-foreground">
              You are on the Free plan
            </p>
          )}
        </Card>

        <Card className={cn("flex flex-col border-premium/30 p-6", premium && "bg-premium-tint/20")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Premium</h3>
              <Crown className="size-4 text-premium" />
            </div>
            {premium && <PremiumBadge />}
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {usd(PREMIUM_PRICE)} <span className="text-sm font-normal text-muted-foreground">/ month</span>
          </p>
          <ul className="mt-5 flex-1 space-y-3 text-sm text-secondary-foreground">
            {["Unlimited active services", "Featured promotion in search", "Priority support"].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" /> {feature}
              </li>
            ))}
          </ul>
          {premium ? (
            <p className="mt-6 rounded-xl bg-premium-tint p-3 text-center text-xs font-medium text-premium">
              {cancelAtPeriodEnd ? `Ends on ${expiry}` : `Active until ${expiry}`}
            </p>
          ) : (
            <Button className="mt-6 w-full rounded-full" onClick={upgrade} disabled={upgradeLoading}>
              {upgradeLoading ? (
                <><LoaderCircle className="size-4 animate-spin" /> Opening checkout…</>
              ) : (
                <><Sparkles className="size-4" /> Upgrade to Premium</>
              )}
            </Button>
          )}
        </Card>
      </div>

      {/* Transaction history */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Transaction history</h2>
        </div>

        {transactions.loading ? (
          <Skeleton className="h-40 w-full rounded-2xl" />
        ) : transactions.error ? (
          <ErrorState
            title="Couldn't load transactions"
            message={transactions.error}
            onRetry={loadTransactions}
          />
        ) : transactions.items.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="No transactions yet"
            description="When you upgrade to Premium, your payments will appear here."
          />
        ) : (
          <>
            <Card className="hidden overflow-hidden p-0 lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.items.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell className="text-sm text-secondary-foreground">{formatDate(tx.createdAt)}</TableCell>
                      <TableCell className="text-sm capitalize text-secondary-foreground">{tx.plan}</TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {usd(tx.amount)} {String(tx.currency || "usd").toUpperCase()}
                      </TableCell>
                      <TableCell><PaymentStatus status={tx.status} /></TableCell>
                      <TableCell className="max-w-40 truncate font-mono text-xs text-muted-foreground">
                        {tx.stripeSessionId || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className="space-y-3 lg:hidden">
              {transactions.items.map((tx) => (
                <Card key={tx._id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{usd(tx.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.createdAt)} · <span className="capitalize">{tx.plan}</span>
                    </p>
                  </div>
                  <PaymentStatus status={tx.status} />
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cancel confirmation */}
      <AlertDialog open={confirmCancel} onOpenChange={(open) => !open && setConfirmCancel(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your Premium subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Your Premium features will stay active until <strong>{expiry}</strong>, then your
              account will move to the Free plan and only {FREE_SERVICE_LIMIT} services will remain
              active. No further charges will be made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep Premium</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancel}
              disabled={cancelLoading}
              className="rounded-full bg-error hover:bg-error/90"
            >
              {cancelLoading ? <><LoaderCircle className="size-4 animate-spin" /> Cancelling…</> : "Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
