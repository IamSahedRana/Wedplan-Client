"use client";

import { Copy, LockKeyhole, ReceiptText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const LIMIT = 20;
const STATUSES = ["paid", "pending", "failed"];

function usd(value, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: String(currency || "usd").toUpperCase(),
    minimumFractionDigits: 2,
  }).format((Number(value) || 0) / 100);
}

function shortSession(id) {
  if (!id) return "—";
  return id.length > 18 ? `${id.slice(0, 10)}…${id.slice(-6)}` : id;
}

export function Transactions() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: null, items: [], total: 0, pages: 1 });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (status !== "all") params.set("status", status);

    api
      .get(`/admin/transactions?${params}`)
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
          error: err.message || "Failed to load transactions",
          items: [],
          total: 0,
          pages: 1,
        })
      );
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function copySession(id) {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Stripe session ID copied");
    } catch {
      toast.error("Could not copy the session ID");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transactions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A read-only record of subscription payments processed by Stripe.
        </p>
      </div>

      <Card className="flex flex-col gap-3 border-primary/20 bg-accent/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-secondary-foreground">
          <LockKeyhole className="size-4 shrink-0 text-primary" />
          This ledger is read-only. Payments are managed by Stripe and cannot be edited here.
        </p>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
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
        <ErrorState title="Couldn't load transactions" message={state.error} onRetry={load} />
      ) : state.items.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No transactions found"
          description="Subscription payments will appear here once vendors upgrade."
        />
      ) : (
        <>
          <Card className="hidden overflow-hidden p-0 lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stripe session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.items.map((tx) => (
                  <TableRow key={tx._id}>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>
                      <p className="max-w-44 truncate text-sm font-medium text-foreground">
                        {tx.vendor?.businessName || tx.vendor?.name || "Unknown vendor"}
                      </p>
                      <p className="max-w-44 truncate text-xs text-muted-foreground">{tx.vendor?.email || "—"}</p>
                    </TableCell>
                    <TableCell className="text-sm capitalize text-secondary-foreground">{tx.plan}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground">{usd(tx.amount, tx.currency)}</TableCell>
                    <TableCell><TransactionStatus status={tx.status} /></TableCell>
                    <TableCell>
                      {tx.stripeSessionId ? (
                        <button
                          type="button"
                          onClick={() => copySession(tx.stripeSessionId)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 font-mono text-xs text-secondary-foreground transition hover:bg-muted hover:text-primary"
                          title="Copy full session ID"
                        >
                          {shortSession(tx.stripeSessionId)} <Copy className="size-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="space-y-3 lg:hidden">
            {state.items.map((tx) => (
              <Card key={tx._id} className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {tx.vendor?.businessName || tx.vendor?.name || "Unknown vendor"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                  <TransactionStatus status={tx.status} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize text-secondary-foreground">{tx.plan}</span>
                  <span className="font-semibold text-foreground">{usd(tx.amount, tx.currency)}</span>
                </div>
                {tx.stripeSessionId && (
                  <button
                    type="button"
                    onClick={() => copySession(tx.stripeSessionId)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2 py-1 font-mono text-xs text-secondary-foreground"
                  >
                    {shortSession(tx.stripeSessionId)} <Copy className="size-3.5" />
                  </button>
                )}
              </Card>
            ))}
          </div>

          <Pagination page={page} pages={state.pages} total={state.total} limit={LIMIT} onPage={setPage} />
        </>
      )}
    </div>
  );
}

function TransactionStatus({ status }) {
  const styles = {
    paid: "bg-success-tint text-success",
    pending: "bg-warning-tint text-warning",
    failed: "bg-error-tint text-error",
  };
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", styles[status] || "bg-muted text-muted-foreground")}>
      {status || "unknown"}
    </Badge>
  );
}
