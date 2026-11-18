"use client";

import { SearchX, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { ServiceGridSkeleton } from "@/components/shared/ServiceCardSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

const LIMIT = 12;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function ServicesBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local (debounced) text inputs
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const [state, setState] = useState({ loading: true, error: null, data: null });
  const debounceRef = useRef(null);

  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  function setParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === "" || value == null) params.delete(key);
      else params.set(key, value);
    }
    if (!("page" in updates)) params.delete("page");
    const qs = params.toString();
    router.replace(`/services${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  // Debounced sync of text inputs into the URL
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const current = searchParams;
      if ((current.get("q") || "") !== q) setParams({ q });
      if ((current.get("location") || "") !== location) setParams({ location });
      if ((current.get("minPrice") || "") !== minPrice) setParams({ minPrice });
      if ((current.get("maxPrice") || "") !== maxPrice) setParams({ maxPrice });
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, location, minPrice, maxPrice]);

  const load = useCallback(
    (signal) => {
      setState({ loading: true, error: null, data: null });
      const qs = new URLSearchParams();
      for (const key of ["q", "category", "location", "minPrice", "maxPrice"]) {
        const v = searchParams.get(key);
        if (v) qs.set(key, v);
      }
      qs.set("sort", sort);
      qs.set("page", String(page));
      qs.set("limit", String(LIMIT));

      api
        .get(`/services?${qs.toString()}`, { signal })
        .then((data) => setState({ loading: false, error: null, data }))
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setState({ loading: false, error: err.message || "Failed to load services", data: null });
        });
    },
    [searchParams, sort, page]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function clearFilters() {
    setQ("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    router.replace("/services", { scroll: false });
  }

  const activeChips = [];
  for (const [key, label] of [
    ["q", "Search"],
    ["category", "Category"],
    ["location", "Location"],
    ["minPrice", "Min ৳"],
    ["maxPrice", "Max ৳"],
  ]) {
    const value = searchParams.get(key);
    if (value) {
      activeChips.push({
        key,
        text:
          key === "category" || key === "location"
            ? value
            : key === "minPrice" || key === "maxPrice"
              ? `${label} ${value}`
              : `“${value}”`,
      });
    }
  }
  if (sort !== "newest") {
    activeChips.push({
      key: "sort",
      text: SORT_OPTIONS.find((o) => o.value === sort)?.label || sort,
    });
  }

  const removeChip = (key) => {
    if (key === "q") setQ("");
    if (key === "location") setLocation("");
    if (key === "minPrice") setMinPrice("");
    if (key === "maxPrice") setMaxPrice("");
    setParams({ [key]: "" });
  };

  const data = state.data;
  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  return (
    <div className="pb-20">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-40 border-b border-border bg-white/95 backdrop-blur">
        <div className="container-page space-y-3 py-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <div className="col-span-2">
              <Input
                placeholder="Search services…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={category} onValueChange={(v) => setParams({ category: v === "all" ? "" : v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Min ৳"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                type="number"
                min="0"
                placeholder="Max ৳"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={sort} onValueChange={(v) => setParams({ sort: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="shrink-0 rounded-full"
                onClick={clearFilters}
                title="Clear all filters"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Active filter chips + result count */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {state.loading ? "Loading…" : `${total} service${total === 1 ? "" : "s"} found`}
            </span>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => removeChip(chip.key)}
                className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary transition hover:bg-accent/70"
              >
                {chip.text}
                <X className="size-3" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-page pt-10">
        {state.loading ? (
          <ServiceGridSkeleton count={LIMIT > 8 ? 8 : LIMIT} />
        ) : state.error ? (
          <ErrorState title="Couldn't load services" message={state.error} onRetry={() => load()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No services match your filters"
            description="Try a different search term, widen your price range, or clear the filters."
            action={
              <Button variant="outline" className="rounded-full" onClick={clearFilters}>
                Clear Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!state.loading && !state.error && total > 0 && pages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setParams({ page: String(page - 1) })}
            >
              Prev
            </Button>
            {Array.from({ length: pages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === pages || Math.abs(p - page) <= 1
              )
              .map((p, idx, arr) => (
                <span key={p} className="flex items-center gap-2">
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground">…</span>}
                  <Button
                    variant={p === page ? "default" : "outline"}
                    className="size-10 rounded-full p-0"
                    onClick={() => setParams({ page: String(p) })}
                  >
                    {p}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              className="rounded-full"
              disabled={page >= pages}
              onClick={() => setParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
