"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, className, variants }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { _id, serviceName, category, price, location, images = [] } = service;
  const featured = service.featured || service.vendor?.plan === "premium" || service.premium;

  // /services/[id] is a private route: unauthenticated clicks get a toast +
  // redirect to /signin?redirect=/services/[id].
  function handleClick(e) {
    if (isPending || session?.user) return;
    e.preventDefault();
    toast.error("Please sign in to view service details");
    router.push(`/signin?redirect=/services/${_id}`);
  }

  return (
    <motion.div
      variants={variants}
      initial={variants ? undefined : { opacity: 0, y: 16 }}
      whileInView={variants ? undefined : { opacity: 1, y: 0 }}
      viewport={variants ? undefined : { once: true, margin: "-40px" }}
      transition={variants ? undefined : { duration: 0.4, ease: "easeOut" }}
      className={cn("h-full", className)}
    >
      <Link href={`/services/${_id}`} onClick={handleClick} className="block h-full outline-none">
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
            {featured && (
              <div className="absolute end-3 top-3">
                <PremiumBadge>Featured</PremiumBadge>
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
