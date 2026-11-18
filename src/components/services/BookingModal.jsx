"use client";

import { CalendarDays, Loader2, Mail, MapPin, Store, User } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";

const bookingSchema = z
  .object({
    eventDate: z
      .string()
      .min(1, "Event date is required")
      .refine(
        (v) => {
          const d = new Date(`${v}T00:00:00Z`);
          return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
        },
        { message: "Event date must be a future date" }
      ),
    eventLocation: z
      .string()
      .min(3, "Event location is required")
      .max(120, "Event location is too long"),
    message: z.string().max(500, "Message is too long (max 500 characters)").optional(),
  })
  .strict();

const EMPTY = { eventDate: "", eventLocation: "", message: "" };

export function BookingModal({ open, onOpenChange, service, user }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [inlineError, setInlineError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fresh form every time the modal opens.
  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setErrors({});
      setInlineError("");
    }
  }, [open]);

  if (!service || !user) return null;

  const vendor = service.vendor || {};

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setInlineError("");

    const parsed = bookingSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] && !fieldErrors[issue.path[0]]) fieldErrors[issue.path[0]] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await api.post("/bookings", { serviceId: service._id, ...parsed.data });
      toast.success("Booking request sent — track it from your dashboard");
      onOpenChange(false);
    } catch (err) {
      // Duplicate bookings (409) and other API errors surface inline.
      setInlineError(err.message || "Failed to send booking request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Booking</DialogTitle>
          <DialogDescription>
            {service.serviceName} · {formatPrice(service.price)} — the vendor will accept or reject
            your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only context: who is booking, and which vendor */}
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/60 p-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <User className="size-3" /> Customer
              </p>
              <Input value={user.name || ""} disabled className="bg-white" />
              <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Mail className="size-3 shrink-0" />
                {user.email}
              </p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Store className="size-3" /> Vendor
              </p>
              <Input
                value={vendor.businessName || vendor.name || ""}
                disabled
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eventDate">Event date</Label>
            <div className="relative">
              <Input
                id="eventDate"
                type="date"
                min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)}
                value={values.eventDate}
                onChange={(e) => set("eventDate", e.target.value)}
                className="pr-10"
              />
              <CalendarDays className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.eventDate && <p className="text-xs text-error">{errors.eventDate}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="eventLocation">Event location</Label>
            <div className="relative">
              <Input
                id="eventLocation"
                placeholder="e.g. Gulshan, Dhaka"
                value={values.eventLocation}
                onChange={(e) => set("eventLocation", e.target.value)}
                className="pr-10"
              />
              <MapPin className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {errors.eventLocation && <p className="text-xs text-error">{errors.eventLocation}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              rows={3}
              placeholder="Anything the vendor should know about your event…"
              value={values.message}
              onChange={(e) => set("message", e.target.value)}
            />
            {errors.message && <p className="text-xs text-error">{errors.message}</p>}
          </div>

          {inlineError && (
            <p className="rounded-xl bg-error-tint px-3 py-2 text-sm text-error">{inlineError}</p>
          )}

          <Button type="submit" disabled={submitting} className="w-full rounded-full">
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Sending request…" : "Send Booking Request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
