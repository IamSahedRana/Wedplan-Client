import { Heart } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-white">
        <Heart className="size-4 fill-current" />
      </span>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Wed<span className="text-primary">Plan</span>
      </span>
    </Link>
  );
}
