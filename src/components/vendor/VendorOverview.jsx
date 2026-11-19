"use client";

import {
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Clock3,
  ExternalLink,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/components/shared/ErrorState";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { FREE_SERVICE_LIMIT } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

function StatCard({ icon: Icon, label, value, tint = "bg-accent text-primary" }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    : "—";
}

export function VendorOverview() {
  const [state, setState] = useState({ loading: true, error: null, stats: null, bookings: [], services: [] });

  const load = useCallback(() => {
    setState({ loading: true, error: null, stats: null, bookings: [], services: [] });
    Promise.all([
      api.get("/vendor/stats"),
      api.get("/vendor/bookings"),
      api.get("/vendor/services"),
    ])
      .then(([stats, bookingData, serviceData]) =>
        setState({
          loading: false,
          error: null,
          stats,
          bookings: bookingData.items || [],
          services: serviceData.items || [],
        })
      )
      .catch((err) =>
        setState({ loading: false, error: err.message || "Failed to load dashboard", stats: null, bookings: [], services: [] })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-52" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (state.error) {
    return <ErrorState title="Couldn't load your dashboard" message={state.error} onRetry={load} />;
  }

  const { stats, bookings, services } = state;
  const active = stats.activeServices || 0;
  const isFree = stats.plan !== "premium";
  const pct = Math.min(100, (active / FREE_SERVICE_LIMIT) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your business at a glance — services, bookings and plan usage.
          </p>
        </div>
        {isFree ? <Badge variant="outline" className="rounded-full">Free Plan</Badge> : <PremiumBadge />}
      </div>

      {/* 5 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Store} label="Total Services" value={stats.totalServices || 0} />
        <StatCard
          icon={BadgeCheck}
          label="Active Services"
          value={active}
          tint="bg-success-tint text-success"
        />
        <StatCard
          icon={Clock3}
          label="Pending Bookings"
          value={stats.pendingBookings || 0}
          tint="bg-warning-tint text-warning"
        />
        <StatCard
          icon={CalendarCheck}
          label="Accepted Bookings"
          value={stats.acceptedBookings || 0}
          tint="bg-success-tint text-success"
        />
        <StatCard icon={CalendarDays} label="Total Bookings" value={bookings.length} />
      </div>

      {/* Free plan usage bar */}
      {isFree && (
        <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">
              Free plan usage: <span className="text-primary">{active} of {FREE_SERVICE_LIMIT} active</span> services
            </p>
            <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              Upgrade to Premium for unlimited services and a premium badge on your listings.
            </p>
          </div>
          <Button asChild className="w-full shrink-0 rounded-full sm:w-auto">
            <Link href="/dashboard/vendor/subscription">Upgrade</Link>
          </Button>
        </Card>
      )}

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Booking Requests</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/dashboard/vendor/bookings">
                View all <ExternalLink className="size-3" />
              </Link>
            </Button>
          </div>
          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No booking requests yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {bookings.slice(0, 5).map((b) => (
                <li key={b._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {b.service?.serviceName || "Service"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {b.customer?.name || "Customer"} · {formatDate(b.eventDate)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Services</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link href="/dashboard/vendor/my-services">
                View all <ExternalLink className="size-3" />
              </Link>
            </Button>
          </div>
          {services.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No services yet — create your first one.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {services.slice(0, 5).map((s) => (
                <li key={s._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{s.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(s.price)}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
