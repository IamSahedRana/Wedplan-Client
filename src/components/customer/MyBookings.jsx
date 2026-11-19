"use client";

import { CalendarClock, CalendarDays, Eye, MapPin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

const TABS = ["all", "pending", "accepted", "rejected", "cancelled"];

export function MyBookings() {
  const [state, setState] = useState({ loading: true, error: null, items: [] });
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(() => {
    setState({ loading: true, error: null, items: [] });
    api
      .get("/bookings/my")
      .then((data) => setState({ loading: false, error: null, items: data.items || [] }))
      .catch((err) =>
        setState({ loading: false, error: err.message || "Failed to load bookings", items: [] })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setProcessing(true);
    try {
      await api.patch(`/bookings/${cancelTarget._id}/cancel`);
      const updated = { ...cancelTarget, status: "cancelled" };
      setState((s) => ({
        ...s,
        items: s.items.map((b) => (b._id === updated._id ? updated : b)),
      }));
      setSelected((b) => (b && b._id === updated._id ? updated : b));
      toast.success("Booking request cancelled");
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.message || "Could not cancel booking");
    } finally {
      setProcessing(false);
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return <ErrorState title="Couldn't load your bookings" message={state.error} onRetry={load} />;
  }

  const { items } = state;
  const filtered = tab === "all" ? items : items.filter((b) => b.status === tab);
  const countFor = (key) => (key === "all" ? items.length : items.filter((b) => b.status === key).length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your requests and their latest status.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/services">Find more services</Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((key) => (
            <TabsTrigger key={key} value={key} className="capitalize">
              {key} <span className="ms-1 text-xs text-muted-foreground">({countFor(key)})</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={items.length === 0 ? "No bookings yet" : `No ${tab} bookings`}
          description={
            items.length === 0
              ? "Find a service you love and send your first booking request."
              : "Bookings with this status will appear here."
          }
          action={
            items.length === 0 ? (
              <Button asChild className="rounded-full">
                <Link href="/services">Browse Services</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden p-0 lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Event date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {b.service?.images?.[0] && (
                            <Image
                              src={b.service.images[0]}
                              alt={b.service.serviceName}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-48 truncate text-sm font-medium text-foreground">
                            {b.service?.serviceName || "Service"}
                          </p>
                          <p className="text-xs text-primary">{formatPrice(b.service?.price)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-secondary-foreground">
                      {b.vendor?.businessName || b.vendor?.name || "Vendor"}
                    </TableCell>
                    <TableCell className="text-sm text-secondary-foreground">
                      {formatDate(b.eventDate)}
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-sm text-secondary-foreground">
                      {b.eventLocation}
                    </TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(b.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setSelected(b)}
                        >
                          <Eye className="size-4" /> Details
                        </Button>
                        {b.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-error"
                            onClick={() => setCancelTarget(b)}
                          >
                            <X className="size-4" /> Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((b) => (
              <Card key={b._id} className="space-y-3 p-4">
                <div className="flex items-center gap-3">
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
                    <p className="truncate text-sm font-semibold text-foreground">
                      {b.service?.serviceName || "Service"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {b.vendor?.businessName || b.vendor?.name || "Vendor"}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" /> {formatDate(b.eventDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {b.eventLocation}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    Requested {formatDate(b.createdAt)}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setSelected(b)}
                    >
                      <Eye className="size-4" /> Details
                    </Button>
                    {b.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-error"
                        onClick={() => setCancelTarget(b)}
                      >
                        <X className="size-4" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Details drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-md">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>Booking details</SheetTitle>
                <SheetDescription>
                  Requested {formatDate(selected.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="flex items-center justify-between">
                <StatusBadge status={selected.status} />
                <span className="text-xs text-muted-foreground">#{selected._id.slice(-6)}</span>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {selected.service?.images?.[0] && (
                    <Image
                      src={selected.service.images[0]}
                      alt={selected.service.serviceName}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {selected.service?.serviceName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected.service?.category} · {formatPrice(selected.service?.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  {selected.vendor?.image && (
                    <AvatarImage src={selected.vendor.image} alt={selected.vendor.name} />
                  )}
                  <AvatarFallback className="bg-accent text-primary">
                    {(selected.vendor?.name || "V").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selected.vendor?.businessName || selected.vendor?.name || "Vendor"}
                  </p>
                  <p className="text-xs text-muted-foreground">Service provider</p>
                </div>
              </div>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Event date
                  </dt>
                  <dd className="mt-1 font-medium text-foreground">{formatDate(selected.eventDate)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <MapPin className="size-3" /> Event location
                  </dt>
                  <dd className="mt-1 text-foreground">{selected.eventLocation}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Message
                  </dt>
                  <dd className="mt-1 whitespace-pre-line text-foreground">
                    {selected.message || "No message provided."}
                  </dd>
                </div>
              </dl>

              {selected.status === "pending" ? (
                <Button
                  variant="outline"
                  className="w-full rounded-full text-error hover:text-error"
                  onClick={() => setCancelTarget(selected)}
                >
                  <X className="size-4" /> Cancel request
                </Button>
              ) : (
                <p className="rounded-xl bg-muted/60 p-3 text-center text-sm text-muted-foreground">
                  This booking has already been processed.
                </p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancel confirmation */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking request?</AlertDialogTitle>
            <AlertDialogDescription>
              Your request for {cancelTarget?.service?.serviceName || "this service"} on{" "}
              {formatDate(cancelTarget?.eventDate)} will be cancelled. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Keep request</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={processing}
              className="rounded-full bg-error hover:bg-error/90"
            >
              {processing ? "Cancelling…" : "Cancel request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
