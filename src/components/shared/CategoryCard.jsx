import { Camera, Flower2, Shirt, Sparkles, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";

const CATEGORY_ICONS = {
  "photography & videography": Camera,
  "wedding venues": Sparkles,
  "decoration & florist": Flower2,
  "catering services": UtensilsCrossed,
  "makeup & styling": Sparkles,
  "wedding fashion": Shirt,
};

function iconFor(category) {
  return CATEGORY_ICONS[String(category).toLowerCase()] || Camera;
}

export function CategoryCard({ category, count, href, className }) {
  const Icon = iconFor(category);
  return (
    <Link href={href || `/services?category=${encodeURIComponent(category)}`} className="block outline-none">
      <Card className="card-lift flex flex-col items-center gap-3 p-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
          <Icon className="size-6" />
        </span>
        <span className="font-semibold text-foreground">{category}</span>
        {count !== undefined && (
          <span className="text-sm text-muted-foreground">
            {count} service{count === 1 ? "" : "s"}
          </span>
        )}
      </Card>
    </Link>
  );
}
