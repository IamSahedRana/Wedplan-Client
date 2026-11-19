"use client";

import { CalendarClock, Check, Eye, MapPin, X } from "lucide-react";
import Image from "next/image";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

const TABS = ["all", "pending", "accepted", "rejected", "cancelled"];

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

export function BookingRequests() {
  const [state, setState] = useState({ loading: true, error: null, items: [] });
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(() => {
    setState({ loading: true, error: null, items: [] });
    api
      .get("/vendor/bookings")
      .then((data) => setState({ loading: false, error: null, items: data.items || [] }))
      .catch((err) =>
        setState({ loading: false, error: err.message || "Failed to load bookings", items: [] })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus() {
    if (!selected || !confirmStatus) return;
    setProcessing(true);
    try {
      await api.patch(`/bookings/${selected._id}/status`, { status: confirmStatus });
      setState((s) => ({
        ...s,
        items: s.items.map((b) =>
          b._id === selected._id ? { ...b, status: confirmStatus } : b
        ),
      }));
      setSelected((b) => (b ? { ...b, status: confirmStatus } : b));
      toast.success(confirmStatus === "accepted" ? "Booking accepted" : "Booking rejected");
      setConfirmStatus(null);
    } catch (err) {
      toast.error(err.message || "Could not update booking");
    } finally {
      setProcessing(false);
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-10 w-full max-w-lg" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return <ErrorState title="Couldn't load booking requests" message={state.error} onRetry={load} />;
  }

  const { items } = state;
  const filtered = tab === "all" ? items : items.filter((b) => b.status === tab);
  const countFor = (key) => (key === "all" ? items.length : items.filter((b) => b.status === key).length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Booking Requests</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and respond to couples who want to book your services.
        </p>
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
          title={items.length === 0 ? "No booking requests yet" : `No ${tab} bookings`}
          description={
            items.length === 0
              ? "When customers request your services, they'll appear here."
              : "Bookings with this status will appear here."
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Event date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-end">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell className="max-w-52 truncate text-sm font-medium text-foreground">
                      {b.service?.serviceName || "Service"}
                    </TableCell>
                    <TableCell className="text-sm text-secondary-foreground">
                      {b.customer?.name || "Customer"}
                    </TableCell>
                    <TableCell className="text-sm text-secondary-foreground">
                      {formatDate(b.eventDate)}
                    </TableCell>
                    <TableCell className="max-w-40 truncate text-sm text-secondary-foreground">
                      {b.eventLocation}
                    </TableCell>
                    <TableCell><StatusBadge status={b.status} /></TableCell>
                    <TableCell className="text-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setSelected(b)}
                      >
                        <Eye className="size-4" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((b) => (
              <Card key={b._id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {b.service?.serviceName || "Service"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {b.customer?.name || "Customer"} · {formatDate(b.eventDate)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={b.status} />
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setSelected(b)}>
                    <Eye className="size-4" />
                  </Button>
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
                  <p className="text-xs text-muted-foreground">{selected.service?.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  {selected.customer?.image && (
                    <AvatarImage src={selected.customer.image} alt={selected.customer.name} />
                  )}
                  <AvatarFallback className="bg-accent text-primary">
                    {(selected.customer?.name || "C").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selected.customer?.name || "Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">Booking customer</p>
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
                <div className="flex gap-3 border-t border-border pt-5">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => setConfirmStatus("rejected")}
                  >
                    <X className="size-4" /> Reject
                  </Button>
                  <Button
                    className="flex-1 rounded-full"
                    onClick={() => setConfirmStatus("accepted")}
                  >
                    <Check className="size-4" /> Accept
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-muted/60 p-3 text-center text-sm text-muted-foreground">
                  Already processed — no further action needed.
                </p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Accept / reject confirmation */}
      <AlertDialog open={!!confirmStatus} onOpenChange={(open) => !open && setConfirmStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmStatus === "accepted" ? "Accept this booking?" : "Reject this booking?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmStatus === "accepted"
                ? "The customer will see their booking as accepted and you'll be expected to provide the service on the event date."
                : "The customer will be notified that their request was rejected. This cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={updateStatus}
              disabled={processing}
              className={
                confirmStatus === "rejected"
                  ? "rounded-full bg-error hover:bg-error/90"
                  : "rounded-full"
              }
            >
              {processing ? "Processing…" : confirmStatus === "accepted" ? "Accept" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
