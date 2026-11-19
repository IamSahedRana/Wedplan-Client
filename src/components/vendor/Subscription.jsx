"use client";

import { Check, CreditCard, Crown, LoaderCircle, ReceiptText, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { FREE_SERVICE_LIMIT } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRO_PRICE = 9.99;

function usd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function isProActive(user) {
  return user?.subscriptionPlan === "PRO" && user?.subscriptionTimeline === "UNLIMITED";
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
      .get("/payments/transactions")
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
      const data = await api.post("/payments/create-checkout-session");
      if (!data?.url) throw new Error("Stripe did not return a checkout URL");
      toast.success("Redirecting to secure checkout…");
      window.location.assign(data.url);
    } catch (err) {
      toast.error(err.message || "Could not start checkout");
      setUpgradeLoading(false);
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

  const pro = isProActive(profile.user);

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
          pro && "border-premium/30 bg-premium-tint/30"
        )}
      >
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              pro ? "bg-premium-tint text-premium" : "bg-accent text-primary"
            )}
          >
            {pro ? <Crown className="size-6" /> : <CreditCard className="size-6" />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Your current plan</h2>
              {pro ? (
                <PremiumBadge>Pro</PremiumBadge>
              ) : (
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
                  Free Plan
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-secondary-foreground">
              {pro ? (
                <>
                  Lifetime Pro access is active — unlimited service listings, featured promotion
                  and priority support. No renewal, no expiry.
                </>
              ) : (
                <>
                  Free plan — up to {FREE_SERVICE_LIMIT} active services. Upgrade any time for
                  lifetime Pro access.
                </>
              )}
            </p>
            {pro && (
              <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                <p className="font-mono">Subscription ID: {profile.user?.subscriptionId || "—"}</p>
                <p>Timeline: UNLIMITED</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Pricing cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Free</h3>
            {!pro && <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">Current plan</span>}
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
          {!pro && (
            <p className="mt-6 rounded-xl bg-muted/60 p-3 text-center text-xs text-muted-foreground">
              You are on the Free plan
            </p>
          )}
        </Card>

        <Card className={cn("flex flex-col border-premium/30 p-6", pro && "bg-premium-tint/20")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Pro</h3>
              <Crown className="size-4 text-premium" />
            </div>
            {pro && <PremiumBadge>Active</PremiumBadge>}
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">
            {usd(PRO_PRICE)} <span className="text-sm font-normal text-muted-foreground">/ one-time</span>
          </p>
          <ul className="mt-5 flex-1 space-y-3 text-sm text-secondary-foreground">
            {["Unlimited active services", "Featured promotion in search", "Priority support"].map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-success" /> {feature}
              </li>
            ))}
          </ul>
          {pro ? (
            <p className="mt-6 rounded-xl bg-premium-tint p-3 text-center text-xs font-medium text-premium">
              Active forever · UNLIMITED
            </p>
          ) : (
            <Button className="mt-6 w-full rounded-full" onClick={upgrade} disabled={upgradeLoading}>
              {upgradeLoading ? (
                <><LoaderCircle className="size-4 animate-spin" /> Opening checkout…</>
              ) : (
                <><Sparkles className="size-4" /> Upgrade to Pro</>
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
            description="When you upgrade to Pro, your payments will appear here."
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
                        {usd((Number(tx.amount) || 0) / 100)} {String(tx.currency || "usd").toUpperCase()}
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
                    <p className="text-sm font-semibold text-foreground">{usd((Number(tx.amount) || 0) / 100)}</p>
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
    </div>
  );
}
