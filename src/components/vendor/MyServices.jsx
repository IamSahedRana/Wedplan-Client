"use client";

import { Eye, Pencil, Plus, Store, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ServiceForm } from "@/components/vendor/ServiceForm";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { FREE_SERVICE_LIMIT } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const TABS = ["all", "approved", "pending", "rejected"];

export function MyServices() {
  const [state, setState] = useState({ loading: true, error: null, items: [], plan: "free" });
  const [tab, setTab] = useState("all");
  const [editService, setEditService] = useState(null);
  const [deleteService, setDeleteService] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setState({ loading: true, error: null, items: [], plan: "free" });
    api
      .get("/vendor/services")
      .then((data) =>
        setState({ loading: false, error: null, items: data.items || [], plan: data.plan || "free" })
      )
      .catch((err) =>
        setState({ loading: false, error: err.message || "Failed to load services", items: [], plan: "free" })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleAvailability(service, isActive) {
    try {
      await api.patch(`/services/${service._id}/availability`, { isActive });
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it._id === service._id ? { ...it, isActive } : it)),
      }));
      toast.success(isActive ? "Service activated" : "Service deactivated");
    } catch (err) {
      toast.error(err.message || "Could not update availability");
    }
  }

  async function saveEdit(values) {
    setSaving(true);
    try {
      const { service } = await api.patch(`/services/${editService._id}`, values);
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it._id === service._id ? service : it)),
      }));
      toast.success("Service updated");
      setEditService(null);
    } catch (err) {
      toast.error(err.message || "Could not update service");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/services/${deleteService._id}`);
      setState((s) => ({ ...s, items: s.items.filter((it) => it._id !== deleteService._id) }));
      toast.success("Service deleted");
      setDeleteService(null);
    } catch (err) {
      toast.error(err.message || "Could not delete service");
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (state.error) {
    return <ErrorState title="Couldn't load your services" message={state.error} onRetry={load} />;
  }

  const { items, plan } = state;
  const isFree = plan === "free";
  const activeCount = items.filter((s) => s.isActive).length;
  const filtered = tab === "all" ? items : items.filter((s) => s.status === tab);
  const countFor = (key) => (key === "all" ? items.length : items.filter((s) => s.status === key).length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage listings, availability and approval status.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/dashboard/vendor/add-service">
            <Plus className="size-4" /> Add Service
          </Link>
        </Button>
      </div>

      {isFree && (
        <Card className="flex flex-col gap-2 border-warning/30 bg-warning-tint/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground">
            <strong>Free plan:</strong> {activeCount} of {FREE_SERVICE_LIMIT} active services used.
            Upgrade for unlimited listings.
          </p>
          <Button asChild variant="outline" className="w-full shrink-0 rounded-full sm:w-auto">
            <Link href="/dashboard/vendor/subscription">Upgrade to Premium</Link>
          </Button>
        </Card>
      )}

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
          icon={Store}
          title={items.length === 0 ? "No services yet" : `No ${tab} services`}
          description={
            items.length === 0
              ? "Create your first service to start receiving booking requests."
              : "Services with this status will appear here."
          }
          action={
            items.length === 0 ? (
              <Button asChild className="rounded-full">
                <Link href="/dashboard/vendor/add-service">Add Service</Link>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <ServiceRow
                    key={s._id}
                    service={s}
                    onEdit={() => setEditService(s)}
                    onDelete={() => setDeleteService(s)}
                    onToggle={toggleAvailability}
                  />
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((s) => (
              <Card key={s._id} className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {s.images?.[0] && (
                      <Image src={s.images[0]} alt={s.serviceName} fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{s.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{s.category}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-sm font-semibold text-primary">{formatPrice(s.price)}</p>
                {s.status === "rejected" && (
                  <p className="text-xs text-error">Not visible to customers</p>
                )}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <label className="flex items-center gap-2 text-xs text-secondary-foreground">
                    <Switch
                      checked={!!s.isActive}
                      onCheckedChange={(v) => toggleAvailability(s, v)}
                    />
                    {s.isActive ? "Active" : "Inactive"}
                  </label>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setEditService(s)}>
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full text-error" onClick={() => setDeleteService(s)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* View / edit dialog */}
      <Dialog open={!!editService} onOpenChange={(open) => !open && setEditService(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service details</DialogTitle>
            <DialogDescription>
              Review and edit your listing. Changes are saved immediately.
            </DialogDescription>
          </DialogHeader>
          {editService && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={editService.status} />
                {editService.status === "rejected" && (
                  <span className="text-xs text-error">Not visible to customers</span>
                )}
              </div>
              <ServiceForm initial={editService} submitLabel="Save Changes" submitting={saving} onSubmit={saveEdit} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteService} onOpenChange={(open) => !open && setDeleteService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteService?.serviceName} will be permanently removed along with its booking history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-full bg-error hover:bg-error/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServiceRow({ service: s, onEdit, onDelete, onToggle }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
            {s.images?.[0] && (
              <Image src={s.images[0]} alt={s.serviceName} fill sizes="48px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="max-w-52 truncate text-sm font-medium text-foreground">{s.serviceName}</p>
            {s.status === "rejected" && (
              <p className={cn("text-xs text-error")}>Not visible to customers</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm text-secondary-foreground">{s.category}</TableCell>
      <TableCell className="text-sm font-medium text-primary">{formatPrice(s.price)}</TableCell>
      <TableCell><StatusBadge status={s.status} /></TableCell>
      <TableCell>
        <Switch checked={!!s.isActive} onCheckedChange={(v) => onToggle(s, v)} />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="rounded-full" title="View / edit" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-error" title="Delete" onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
