"use client";

import {
  Check,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  PackageSearch,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Pagination } from "@/components/shared/Pagination";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const LIMIT = 10;
const STATUSES = ["pending", "approved", "rejected"];

export function ManageServices() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialStatus = searchParams.get("status");

  const [search, setSearch] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState(STATUSES.includes(initialStatus) ? initialStatus : "all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: null, items: [], total: 0, pages: 1 });
  const [selectedId, setSelectedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort });
    if (query) params.set("q", query);
    if (status !== "all") params.set("status", status);
    if (category !== "all") params.set("category", category);

    api
      .get(`/admin/services?${params}`)
      .then((data) =>
        setState({
          loading: false,
          error: null,
          items: data.items || [],
          total: data.total || 0,
          pages: data.pages || 1,
        })
      )
      .catch((err) =>
        setState({
          loading: false,
          error: err.message || "Failed to load services",
          items: [],
          total: 0,
          pages: 1,
        })
      );
  }, [page, query, status, category, sort]);

  useEffect(() => {
    load();
  }, [load]);

  function updateItem(updated) {
    setState((s) => ({
      ...s,
      items: s.items.map((item) => (item._id === updated._id ? updated : item)),
    }));
  }

  async function changeStatus(service, action) {
    setBusyId(service._id);
    try {
      const data = await api.patch(`/admin/services/${service._id}/status`, { status: action });
      updateItem(data.service);
      toast.success(data.message || "Service updated");
    } catch (err) {
      toast.error(err.message || "Could not update service");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget._id);
    try {
      await api.delete(`/admin/services/${deleteTarget._id}`);
      setState((s) => ({
        ...s,
        items: s.items.filter((item) => item._id !== deleteTarget._id),
        total: Math.max(0, s.total - 1),
      }));
      if (selectedId === deleteTarget._id) setSelectedId(null);
      toast.success("Service deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || "Could not delete service");
    } finally {
      setBusyId(null);
    }
  }

  const selected = state.items.find((item) => item._id === selectedId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Manage Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review new listings, manage status and remove invalid services.
        </p>
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
          <SelectTrigger aria-label="Sort services">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price_asc">Price: low to high</SelectItem>
            <SelectItem value="price_desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {state.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : state.error ? (
        <ErrorState title="Couldn't load services" message={state.error} onRetry={load} />
      ) : state.items.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No services found"
          description="Try a different search, status or category filter."
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden p-0 lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Listed</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.items.map((service) => (
                  <TableRow
                    key={service._id}
                    className={cn(service.status === "pending" && "bg-warning-tint/40")}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {service.images?.[0] && (
                            <Image src={service.images[0]} alt={service.serviceName} fill sizes="44px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-48 truncate text-sm font-medium text-foreground">{service.serviceName}</p>
                          <p className="max-w-48 truncate text-xs text-muted-foreground">{service.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-36 truncate text-xs text-secondary-foreground">
                      {service.vendor?.businessName || service.vendor?.name || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-primary">{formatPrice(service.price)}</TableCell>
                    <TableCell><StatusBadge status={service.status} /></TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent",
                          service.isActive ? "bg-success-tint text-success" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(service.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full"
                          title="Review"
                          onClick={() => setSelectedId(service._id)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {service.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full text-success"
                              title="Approve"
                              onClick={() => changeStatus(service, "approve")}
                              disabled={busyId === service._id}
                            >
                              <Check className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full text-error"
                              title="Reject"
                              onClick={() => changeStatus(service, "reject")}
                              disabled={busyId === service._id}
                            >
                              <X className="size-4" />
                            </Button>
                          </>
                        )}
                        <StatusMenu
                          service={service}
                          busy={busyId === service._id}
                          onChange={changeStatus}
                          onDelete={() => setDeleteTarget(service)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-3 lg:hidden">
            {state.items.map((service) => (
              <Card
                key={service._id}
                className={cn("space-y-3 p-4", service.status === "pending" && "border-warning/40 bg-warning-tint/30")}
              >
                <div className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {service.images?.[0] && (
                      <Image src={service.images[0]} alt={service.serviceName} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{service.serviceName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {service.vendor?.businessName || service.vendor?.name || "Vendor"}
                    </p>
                  </div>
                  <StatusBadge status={service.status} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-foreground">
                  <span className="font-medium text-primary">{formatPrice(service.price)}</span>
                  <span>{service.category}</span>
                  <span>{service.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 border-t border-border pt-3">
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setSelectedId(service._id)}>
                    <Eye className="size-4" /> Review
                  </Button>
                  {service.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-success"
                        onClick={() => changeStatus(service, "approve")}
                        disabled={busyId === service._id}
                      >
                        <Check className="size-4" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-error"
                        onClick={() => changeStatus(service, "reject")}
                        disabled={busyId === service._id}
                      >
                        <X className="size-4" /> Reject
                      </Button>
                    </>
                  )}
                  <StatusMenu
                    service={service}
                    busy={busyId === service._id}
                    onChange={changeStatus}
                    onDelete={() => setDeleteTarget(service)}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Pagination page={page} pages={state.pages} total={state.total} limit={LIMIT} onPage={setPage} />
        </>
      )}

      {/* Review drawer */}
      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Service review</SheetTitle>
            <SheetDescription>Listing details submitted by the vendor.</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-5">
              <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted">
                {selected.images?.[0] ? (
                  <Image src={selected.images[0]} alt={selected.serviceName} fill sizes="420px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
              </div>
              {selected.images?.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {selected.images.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selected.status} />
                <Badge variant="outline" className={cn("border-transparent", selected.isActive ? "bg-success-tint text-success" : "bg-muted text-muted-foreground")}>
                  {selected.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">{selected.serviceName}</h3>
                <p className="text-sm text-primary">{formatPrice(selected.price)}</p>
              </div>

              <dl className="space-y-4 text-sm">
                {[
                  ["Vendor", selected.vendor?.businessName || selected.vendor?.name || "—"],
                  ["Email", selected.vendor?.email || "—"],
                  ["Category", selected.category],
                  ["Location", selected.location],
                  ["Listed", formatDate(selected.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-foreground">{value || "—"}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</dt>
                  <dd className="mt-1 whitespace-pre-line text-secondary-foreground">{selected.description || "—"}</dd>
                </div>
              </dl>

              <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                {selected.status !== "approved" && (
                  <Button
                    variant="outline"
                    className="rounded-full text-success"
                    onClick={() => changeStatus(selected, "approve")}
                    disabled={busyId === selected._id}
                  >
                    <Check className="size-4" /> Approve
                  </Button>
                )}
                {selected.status !== "rejected" && (
                  <Button
                    variant="outline"
                    className="rounded-full text-error"
                    onClick={() => changeStatus(selected, "reject")}
                    disabled={busyId === selected._id}
                  >
                    <X className="size-4" /> Reject
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => changeStatus(selected, selected.isActive ? "deactivate" : "activate")}
                  disabled={busyId === selected._id}
                >
                  {selected.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full text-error"
                  onClick={() => setDeleteTarget(selected)}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.serviceName} will be permanently removed along with its booking history.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={busyId === deleteTarget?._id}
              className="rounded-full bg-error hover:bg-error/90"
            >
              {busyId === deleteTarget?._id && <LoaderCircle className="size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusMenu({ service, busy, onChange, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" title="More actions" disabled={busy}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Update listing</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onChange(service, "approve")} disabled={service.status === "approved"}>
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange(service, "reject")} disabled={service.status === "rejected"}>
          Reject
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange(service, service.isActive ? "deactivate" : "activate")}>
          {service.isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-error" onClick={onDelete}>
          Delete service
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
