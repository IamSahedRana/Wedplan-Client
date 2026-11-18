"use client";

import { ArrowLeft, BadgeCheck, MapPin, ShieldAlert, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { BookingModal } from "@/components/services/BookingModal";
import { ServiceGallery } from "@/components/services/ServiceGallery";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";

const OBJECT_ID = /^[0-9a-f]{24}$/i;

function FullPageError({ title, message }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-error-tint text-error">
        <TriangleAlert className="size-7" />
      </span>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {message && <p className="max-w-sm text-sm text-muted-foreground">{message}</p>}
      <Button asChild variant="outline" className="rounded-full">
        <Link href="/services">
          <ArrowLeft className="size-4" />
          Back to Services
        </Link>
      </Button>
    </div>
  );
}

function DetailPageSkeleton() {
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-8">
        <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

export function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const validId = OBJECT_ID.test(id);
  const [state, setState] = useState({ loading: true, error: null, service: null });
  const [similar, setSimilar] = useState({ loading: true, items: [] });
  const [bookingOpen, setBookingOpen] = useState(false);

  // Private route: unauthenticated visitors go to /signin?redirect=/services/[id].
  useEffect(() => {
    if (!isPending && !user) router.replace(`/signin?redirect=/services/${id}`);
  }, [isPending, user, id, router]);

  const load = useCallback(() => {
    if (!validId) {
      setState({ loading: false, error: "Invalid service link", service: null });
      return;
    }
    setState({ loading: true, error: null, service: null });
    api
      .get(`/services/${id}`)
      .then((data) => setState({ loading: false, error: null, service: data.service }))
      .catch((err) =>
        setState({ loading: false, error: err.message || "Failed to load service", service: null })
      );
  }, [id, validId]);

  useEffect(() => {
    if (isPending || !user) return;
    load();
  }, [isPending, user, load]);

  const service = state.service;

  // Similar services in the same category.
  useEffect(() => {
    if (!service) return;
    setSimilar({ loading: true, items: [] });
    const qs = new URLSearchParams({ category: service.category || "", limit: "5" });
    api
      .get(`/services?${qs.toString()}`)
      .then((data) =>
        setSimilar({
          loading: false,
          items: (data.items || []).filter((s) => s._id !== service._id).slice(0, 4),
        })
      )
      .catch(() => setSimilar({ loading: false, items: [] }));
  }, [service?._id, service?.category]);

  // Wait for the session redirect to resolve.
  if (isPending || (!user && !state.error)) return <DetailPageSkeleton />;

  if (!validId) {
    return <FullPageError title="Invalid service link" message="The service you are looking for does not exist." />;
  }
  if (state.error) {
    if (/not found/i.test(state.error)) {
      return (
        <FullPageError
          title="Service not found"
          message="It may have been removed, rejected or is no longer available."
        />
      );
    }
    return (
      <div className="container-page py-16">
        <FullPageErrorInline message={state.error} onRetry={load} />
      </div>
    );
  }

  const isOwner = String(service.vendorId) === user.id;
  const isAdmin = user.role === "admin";
  const isVendor = user.role === "vendor";

  let bookingNote = null;
  if (isAdmin) bookingNote = "Admins cannot request bookings.";
  else if (isOwner) bookingNote = "This is your own service — you cannot book it.";
  else if (isVendor) bookingNote = "Only customers can request bookings.";
  else if (service.status !== "approved" || !service.isActive)
    bookingNote = "This service is not currently available for booking.";

  const canBook = !bookingNote;
  const vendor = service.vendor || {};

  return (
    <div className="pb-20">
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        {/* Left: gallery + info */}
        <div className="min-w-0 space-y-8">
          <ServiceGallery images={service.images || []} name={service.serviceName} />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={service.category} />
              {service.status !== "approved" && <StatusBadge status={service.status} />}
              {!service.isActive && <StatusBadge status="inactive" />}
              {vendor.plan === "premium" && <PremiumBadge />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {service.serviceName}
            </h1>
            {service.location && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                {service.location}
              </p>
            )}
            <p className="whitespace-pre-line leading-relaxed text-secondary-foreground">
              {service.description}
            </p>
          </div>

          {/* Vendor card */}
          <Card className="flex flex-wrap items-center gap-4 p-5">
            <Avatar className="size-14">
              {vendor.image && <AvatarImage src={vendor.image} alt={vendor.name} />}
              <AvatarFallback className="bg-accent text-primary">
                {(vendor.businessName || vendor.name || "V").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Provided by
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold text-foreground">
                  {vendor.businessName || vendor.name}
                </p>
                {vendor.plan === "premium" && <PremiumBadge />}
                <BadgeCheck className="size-4 text-success" aria-label="Verified vendor" />
              </div>
              {vendor.name && vendor.businessName && (
                <p className="truncate text-sm text-muted-foreground">{vendor.name}</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right: sticky booking card */}
        <div>
          <Card className="p-6 lg:sticky lg:top-24">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-3xl font-bold text-primary">{formatPrice(service.price)}</p>
            <div className="my-4 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {service.location || "Location on request"}
              </p>
              <p className="flex items-center gap-2">
                <ShieldAlert className="size-4 shrink-0" />
                Booking confirmed after vendor accepts
              </p>
            </div>
            <Button
              size="lg"
              disabled={!canBook}
              onClick={() => setBookingOpen(true)}
              className="w-full rounded-full"
            >
              Request Booking
            </Button>
            {bookingNote && (
              <p className="mt-3 text-center text-xs text-muted-foreground">{bookingNote}</p>
            )}
          </Card>
        </div>
      </div>

      {/* Similar services */}
      <div className="container-page space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Similar Services
        </h2>
        {similar.loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border shadow-card">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : similar.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No similar services found right now.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.items.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
        )}
      </div>

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        service={service}
        user={user}
      />
    </div>
  );
}

function FullPageErrorInline({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-error-tint text-error">
        <TriangleAlert className="size-7" />
      </span>
      <h2 className="text-xl font-bold text-foreground">Couldn&apos;t load service</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-3">
        <Button variant="outline" className="rounded-full" onClick={onRetry}>
          Try again
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/services">Back to Services</Link>
        </Button>
      </div>
    </div>
  );
}
