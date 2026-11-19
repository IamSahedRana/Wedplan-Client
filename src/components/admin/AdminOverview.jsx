"use client";

import {
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  Clock3,
  PackageSearch,
  Store,
  Users,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHART_PINK = "#D70F64";
const CHART_PINK_LIGHT = "#FBA4C4";
const CHART_PINK_TINT = "#FDE7F0";
const CHART_NEUTRAL = "#E4E4E4";

function StatCard({ icon: Icon, label, value, tint, iconClass, hint }) {
  return (
    <Card className="flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tint, iconClass)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
        {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}

function useLastSixMonths() {
  return useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      months.push({
        key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`,
        label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      });
    }
    return months;
  }, []);
}

export function AdminOverview() {
  const [stats, setStats] = useState({ loading: true, error: null, data: null });
  const [pending, setPending] = useState({ loading: true, error: null, items: [] });
  const [payments, setPayments] = useState({ loading: true, error: null, items: [] });
  const months = useLastSixMonths();

  const loadStats = useCallback(() => {
    setStats({ loading: true, error: null, data: null });
    api
      .get("/admin/stats")
      .then((data) => setStats({ loading: false, error: null, data }))
      .catch((err) =>
        setStats({ loading: false, error: err.message || "Failed to load statistics", data: null })
      );
  }, []);

  const loadPending = useCallback(() => {
    setPending({ loading: true, error: null, items: [] });
    api
      .get("/admin/services?status=pending&limit=5")
      .then((data) => setPending({ loading: false, error: null, items: data.items || [] }))
      .catch((err) =>
        setPending({ loading: false, error: err.message || "Failed to load pending services", items: [] })
      );
  }, []);

  const loadPayments = useCallback(() => {
    setPayments({ loading: true, error: null, items: [] });
    api
      .get("/admin/transactions?limit=100")
      .then((data) => setPayments({ loading: false, error: null, items: data.items || [] }))
      .catch((err) =>
        setPayments({ loading: false, error: err.message || "Failed to load revenue data", items: [] })
      );
  }, []);

  useEffect(() => {
    loadStats();
    loadPending();
    loadPayments();
  }, [loadStats, loadPending, loadPayments]);

  const revenueData = useMemo(() => {
    const totals = Object.fromEntries(months.map((m) => [m.key, 0]));
    for (const tx of payments.items) {
      if (tx.status !== "paid" || !tx.createdAt) continue;
      const d = new Date(tx.createdAt);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      if (key in totals) totals[key] += (Number(tx.amount) || 0) / 100;
    }
    return months.map((m) => ({ name: m.label, revenue: Number(totals[m.key].toFixed(2)) }));
  }, [months, payments.items]);

  const hasRevenue = revenueData.some((point) => point.revenue > 0);

  const roleData = useMemo(() => {
    const s = stats.data || {};
    const admins = Math.max(0, (s.totalUsers || 0) - (s.vendors || 0) - (s.customers || 0));
    return [
      { name: "Vendors", value: s.vendors || 0, color: CHART_PINK },
      { name: "Customers", value: s.customers || 0, color: CHART_PINK_LIGHT },
      { name: "Admins", value: admins, color: CHART_PINK_TINT },
    ];
  }, [stats.data]);

  if (stats.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (stats.error) {
    return <ErrorState title="Couldn't load admin overview" message={stats.error} onRetry={loadStats} />;
  }

  const s = stats.data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of WedPlan activity and items that need your attention.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} label="Total users" value={s.totalUsers || 0} tint="bg-accent" iconClass="text-primary" />
        <StatCard icon={Store} label="Vendors" value={s.vendors || 0} tint="bg-accent" iconClass="text-primary" />
        <StatCard icon={UserRound} label="Customers" value={s.customers || 0} tint="bg-accent/60" iconClass="text-primary" />
        <StatCard icon={PackageSearch} label="Services" value={s.services || 0} tint="bg-muted" iconClass="text-secondary-foreground" />
        <StatCard
          icon={Clock3}
          label="Pending services"
          value={s.pendingServices || 0}
          tint="bg-warning-tint"
          iconClass="text-warning"
          hint="Awaiting review"
        />
        <StatCard
          icon={CircleDollarSign}
          label="Transactions"
          value={s.transactions || 0}
          tint="bg-success-tint"
          iconClass="text-success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Revenue trend</h2>
              <p className="text-xs text-muted-foreground">Paid transactions over the last 6 months</p>
            </div>
            <CalendarClock className="size-5 text-primary" />
          </div>
          {payments.loading ? (
            <Skeleton className="mt-5 h-56 w-full rounded-xl" />
          ) : payments.error ? (
            <ErrorState className="mt-4" title="Couldn't load revenue" message={payments.error} onRetry={loadPayments} />
          ) : !hasRevenue ? (
            <EmptyState className="mt-4" icon={CircleDollarSign} title="No revenue yet" description="Paid subscriptions will appear here." />
          ) : (
            <div className="mt-5 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#9B9B9B" />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#9B9B9B" />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #E4E4E4" }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke={CHART_PINK} strokeWidth={3} dot={{ r: 4, fill: CHART_PINK }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-foreground">Users by role</h2>
          <p className="text-xs text-muted-foreground">Share of each account type</p>
          {(s.totalUsers || 0) === 0 ? (
            <EmptyState className="mt-4" icon={Users} title="No users yet" description="User roles will appear here." />
          ) : (
            <div className="mt-2 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {roleData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E4E4E4" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-foreground">Services awaiting review</h2>
            <p className="text-xs text-muted-foreground">Approve or reject these recent submissions.</p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/admin/services?status=pending">
              View all <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>

        {pending.loading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : pending.error ? (
          <ErrorState className="mt-4" title="Couldn't load pending services" message={pending.error} onRetry={loadPending} />
        ) : pending.items.length === 0 ? (
          <EmptyState className="mt-4" icon={Clock3} title="All caught up" description="There are no services pending review." />
        ) : (
          <div className="mt-4 space-y-2">
            {pending.items.map((service) => (
              <Link
                key={service._id}
                href={`/dashboard/admin/services?status=pending&q=${encodeURIComponent(service.serviceName || "")}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3 transition hover:border-primary/40 hover:bg-accent/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{service.serviceName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {service.vendor?.businessName || service.vendor?.name || "Vendor"} · {service.category}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">{formatPrice(service.price)}</span>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
