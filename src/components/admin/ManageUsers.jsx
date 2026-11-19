"use client";

import { LoaderCircle, Search, ShieldBan, ShieldCheck, UserRoundSearch } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Pagination } from "@/components/shared/Pagination";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const LIMIT = 10;
const ROLE_STYLES = {
  vendor: "bg-accent text-primary",
  customer: "bg-secondary text-secondary-foreground",
  admin: "bg-premium-tint text-premium",
};

function isPaidPremium(user) {
  return (
    (user?.subscriptionPlan === "PRO" && user?.subscriptionTimeline === "UNLIMITED") ||
    (user?.subscriptionPlan === "premium" &&
      !!user?.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt).getTime() > Date.now())
  );
}

function initials(name) {
  return String(name || "U").slice(0, 2).toUpperCase();
}

export function ManageUsers() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: null, items: [], total: 0, pages: 1 });
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState({ loading: false, error: null, user: null });
  const [detailRetry, setDetailRetry] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (query) params.set("q", query);
    if (role !== "all") params.set("role", role);

    api
      .get(`/admin/users?${params}`)
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
          error: err.message || "Failed to load users",
          items: [],
          total: 0,
          pages: 1,
        })
      );
  }, [page, query, role]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail({ loading: false, error: null, user: null });
      return;
    }
    setDetail({ loading: true, error: null, user: null });
    api
      .get(`/admin/users/${selectedId}`)
      .then((data) => setDetail({ loading: false, error: null, user: data.user }))
      .catch((err) =>
        setDetail({ loading: false, error: err.message || "Failed to load user details", user: null })
      );
  }, [selectedId, detailRetry]);

  async function applyBlock() {
    if (!confirm) return;
    setBusy(true);
    try {
      const action = confirm.user.isBlocked ? "unblock" : "block";
      const data = await api.patch(`/admin/users/${confirm.user._id}/${action}`);
      setState((s) => ({
        ...s,
        items: s.items.map((u) => (u._id === data.user._id ? data.user : u)),
      }));
      setDetail((d) => (d.user?._id === data.user._id ? { ...d, user: data.user } : d));
      toast.success(data.message || `User ${action}ed`);
      setConfirm(null);
    } catch (err) {
      toast.error(err.message || "Could not update user");
    } finally {
      setBusy(false);
    }
  }

  const selected = detail.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Manage Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search accounts, review details and control platform access.
        </p>
      </div>

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by role">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="vendor">Vendor</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
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
        <ErrorState title="Couldn't load users" message={state.error} onRetry={load} />
      ) : state.items.length === 0 ? (
        <EmptyState
          icon={UserRoundSearch}
          title="No users found"
          description="Try a different search term or role filter."
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden p-0 lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-end">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.items.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          {user.image && <AvatarImage src={user.image} alt={user.name} />}
                          <AvatarFallback className="bg-accent text-primary text-xs">{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="max-w-48 truncate text-sm font-medium text-foreground">{user.name}</p>
                          <p className="max-w-48 truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-transparent capitalize", ROLE_STYLES[user.role])}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-xs font-medium", user.isBlocked ? "text-error" : "text-success")}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-secondary-foreground">
                      {user.role === "vendor" ? (isPaidPremium(user) ? "Pro" : "Free") : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setSelectedId(user._id)}>
                          View
                        </Button>
                        {user.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("rounded-full", user.isBlocked ? "text-success" : "text-error")}
                            onClick={() => setConfirm({ user })}
                            disabled={busy}
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-3 lg:hidden">
            {state.items.map((user) => (
              <Card key={user._id} className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback className="bg-accent text-primary text-xs">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant="outline" className={cn("border-transparent capitalize", ROLE_STYLES[user.role])}>
                    {user.role}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary-foreground">
                  <span className={user.isBlocked ? "text-error" : "text-success"}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                  <span>Joined {formatDate(user.createdAt)}</span>
                  {user.role === "vendor" && <span>{isPaidPremium(user) ? "Pro" : "Free"}</span>}
                </div>
                <div className="flex gap-1 border-t border-border pt-3">
                  <Button variant="outline" size="sm" className="flex-1 rounded-full" onClick={() => setSelectedId(user._id)}>
                    View details
                  </Button>
                  {user.role !== "admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn("flex-1 rounded-full", user.isBlocked ? "text-success" : "text-error")}
                      onClick={() => setConfirm({ user })}
                      disabled={busy}
                    >
                      {user.isBlocked ? <ShieldCheck className="size-4" /> : <ShieldBan className="size-4" />}
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Pagination page={page} pages={state.pages} total={state.total} limit={LIMIT} onPage={setPage} />
        </>
      )}

      {/* Details drawer */}
      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto p-6 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>User details</SheetTitle>
            <SheetDescription>Full account information for moderation.</SheetDescription>
          </SheetHeader>

          {detail.loading && (
            <div className="mt-6 space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          )}
          {detail.error && !detail.loading && (
            <ErrorState className="mt-6" title="Couldn't load details" message={detail.error} onRetry={() => setDetailRetry((n) => n + 1)} />
          )}
          {selected && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-14">
                  {selected.image && <AvatarImage src={selected.image} alt={selected.name} />}
                  <AvatarFallback className="bg-accent text-primary">{initials(selected.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{selected.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{selected.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn("border-transparent capitalize", ROLE_STYLES[selected.role])}>
                  {selected.role}
                </Badge>
                <Badge variant="outline" className={cn("border-transparent", selected.isBlocked ? "bg-error-tint text-error" : "bg-success-tint text-success")}>
                  {selected.isBlocked ? "Blocked" : "Active"}
                </Badge>
                {selected.role === "vendor" && (
                  <Badge variant="outline" className="border-transparent bg-accent text-primary">
                    {isPaidPremium(selected) ? "Pro" : "Free"}
                  </Badge>
                )}
              </div>

              <dl className="space-y-4 text-sm">
                {[
                  ["Business name", selected.businessName],
                  ["Phone", selected.phone],
                  ["Address", selected.address],
                  ["Bio", selected.bio],
                  ["Joined", formatDate(selected.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="mt-1 whitespace-pre-line text-foreground">{value || "—"}</dd>
                  </div>
                ))}
              </dl>

              {selected.role !== "admin" && (
                <Button
                  variant="outline"
                  className={cn("w-full rounded-full", selected.isBlocked ? "text-success" : "text-error")}
                  onClick={() => setConfirm({ user: selected })}
                  disabled={busy}
                >
                  {selected.isBlocked ? <ShieldCheck className="size-4" /> : <ShieldBan className="size-4" />}
                  {selected.isBlocked ? "Unblock this user" : "Block this user"}
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Block / unblock confirmation */}
      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.user?.isBlocked ? "Unblock this user?" : "Block this user?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.user?.isBlocked
                ? `${confirm?.user?.name} will be able to sign in and use WedPlan again.`
                : `${confirm?.user?.name} will be signed out and unable to access WedPlan until unblocked.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={applyBlock}
              disabled={busy}
              className={cn("rounded-full", !confirm?.user?.isBlocked && "bg-error hover:bg-error/90")}
            >
              {busy && <LoaderCircle className="size-4 animate-spin" />}
              {confirm?.user?.isBlocked ? "Unblock" : "Block user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
