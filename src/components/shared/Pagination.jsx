"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shared table pagination with a compact window of page buttons. */
export function Pagination({ page = 1, pages = 1, total = 0, limit = 20, onPage, disabled = false }) {
  if (pages <= 1) return null;

  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const window = [];
  const first = Math.max(1, Math.min(page - 2, pages - 4));
  for (let p = first; p <= Math.min(pages, first + 4); p += 1) window.push(p);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-secondary-foreground">{start}–{end}</span> of{" "}
        <span className="font-medium text-secondary-foreground">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => onPage(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {window.map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "ghost"}
            size="icon"
            className={cn("size-8 rounded-full text-xs", p === page && "text-primary-foreground")}
            onClick={() => onPage(p)}
            disabled={disabled}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => onPage(page + 1)}
          disabled={disabled || page >= pages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
