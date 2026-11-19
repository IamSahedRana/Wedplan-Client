"use client";

import { CalendarCheck, CalendarClock, CalendarDays, CircleX, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value ?? 0}</p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </Card>
  );
}

export function CustomerOverview() {
  const [state, setState] = useState({ loading: true, error: null, stats: null, bookings: [] });

  const load = useCallback(() => {
    setState({ loading: true, error: null, stats: null, bookings: [] });
    Promise.all([api.get("/customer/stats"), api.get("/bookings/my")])
      .then(([stats, data]) =>
        setState({ loading: false, error: null, stats, bookings: data.items || [] })
      )
      .catch((err) =>
        setState({ loading: false, error: err.message || "Failed to load dashboard", stats: null, bookings: [] })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-52" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (state.error) {
    return <ErrorState title="Couldn't load your dashboard" message={state.error} onRetry={load} />;
  }

  const { stats, bookings } = state;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep track of every booking on your way to the big day.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Total Bookings"
          value={stats?.total}
          tint="bg-accent text-primary"
        />
        <StatCard
          icon={CalendarClock}
          label="Pending"
          value={stats?.pending}
          tint="bg-warning-tint text-warning"
        />
        <StatCard
          icon={CalendarCheck}
          label="Accepted"
          value={stats?.accepted}
          tint="bg-success-tint text-success"
        />
        <StatCard
          icon={CircleX}
          label="Rejected"
          value={stats?.rejected}
          tint="bg-error-tint text-error"
        />
      </div>

      <Card className="relative overflow-hidden border-0 bg-primary p-6 text-white sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl space-y-2">
            <Badge className="border-white/30 bg-white/15 text-white">Wedding planning made easy</Badge>
            <h2 className="text-xl font-semibold sm:text-2xl">Still looking for the perfect vendor?</h2>
            <p className="text-sm text-white/85">
              Explore trusted photographers, venues, decorators and more — then send a booking request in minutes.
            </p>
          </div>
          <Button asChild className="w-full shrink-0 rounded-full bg-white text-primary hover:bg-white/90 sm:w-auto">
            <Link href="/services">
              <Sparkles className="size-4" /> Browse Services
            </Link>
          </Button>
        </div>
        <Sparkles className="pointer-events-none absolute -bottom-8 -end-6 size-40 text-white/10" />
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Bookings</h2>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/customer/bookings">View all</Link>
          </Button>
        </div>
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No bookings yet. Browse services to send your first request.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {bookings.slice(0, 5).map((b) => (
              <li key={b._id} className="flex items-center gap-3 py-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {b.service?.images?.[0] && (
                    <Image
                      src={b.service.images[0]}
                      alt={b.service.serviceName}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {b.service?.serviceName || "Service"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.vendor?.businessName || b.vendor?.name || "Vendor"} · {formatDate(b.eventDate)} ·{" "}
                    {formatPrice(b.service?.price)}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
