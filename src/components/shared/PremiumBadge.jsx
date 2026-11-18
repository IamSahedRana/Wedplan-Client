import { Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PremiumBadge({ className, children = "Premium" }) {
  return (
    <Badge
      className={cn("border-transparent bg-premium text-white gap-1 rounded-full", className)}
    >
      <Crown className="size-3" />
      {children}
    </Badge>
  );
}
