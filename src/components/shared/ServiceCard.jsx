"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, className }) {
  const { _id, serviceName, category, price, location, images = [], premium } = service;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("h-full", className)}
    >
      <Link href={`/services/${_id}`} className="block h-full outline-none">
        <Card className="card-lift h-full overflow-hidden p-0">
          <div className="relative aspect-[4/3] w-full bg-muted">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={serviceName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            ) : null}
            <div className="absolute start-3 top-3 flex gap-2">
              <StatusBadge status={category} className="bg-white/90" />
            </div>
            {premium && (
              <div className="absolute end-3 top-3">
                <PremiumBadge />
              </div>
            )}
          </div>

          <div className="space-y-2 p-4">
            <h3 className="line-clamp-1 font-semibold text-foreground">{serviceName}</h3>
            {location && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="line-clamp-1">{location}</span>
              </p>
            )}
            <p className="pt-1 text-lg font-bold text-primary">{formatPrice(price)}</p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
