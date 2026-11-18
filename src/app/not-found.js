import Link from "next/link";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <Logo className="scale-125" />
      <div className="flex items-center gap-3 text-5xl">
        <span>👰</span>
        <span className="text-primary">💍</span>
        <span>🤵</span>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          This page ran away from the wedding
        </h1>
        <p className="max-w-md text-muted-foreground">
          The page you are looking for is off celebrating somewhere else. Let&apos;s get you back
          to the party.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/services">Browse Services</Link>
        </Button>
      </div>
    </div>
  );
}
