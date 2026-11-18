"use client";

import { ChevronLeft, ChevronRight, Expand, ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ServiceGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const current = images[active];
  const total = images.length;

  function step(dir) {
    setActive((i) => (i + dir + total) % total);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => current && setLightbox(true)}
        disabled={!current}
        className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted outline-none disabled:cursor-default"
      >
        {current ? (
          <Image
            src={current}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" />
          </span>
        )}
        {current && (
          <span className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/85 text-foreground opacity-0 transition group-hover:opacity-100">
            <Expand className="size-4" />
          </span>
        )}
      </button>

      {total > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.slice(0, 6).map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-xl border-2 outline-none transition",
                i === active ? "border-primary opacity-100" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img} alt={`${name} thumbnail ${i + 1}`} fill sizes="140px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-3xl overflow-hidden border-none bg-black/95 p-2">
          <DialogTitle className="sr-only">{name} — image {active + 1} of {total}</DialogTitle>
          <div className="relative aspect-[16/10] w-full">
            {current && (
              <Image src={current} alt={`${name} enlarged`} fill sizes="800px" className="object-contain" />
            )}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous image"
                  className="absolute start-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next image"
                  className="absolute end-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/35"
                >
                  <ChevronRight className="size-5" />
                </button>
                <span className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                  {active + 1} / {total}
                </span>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
