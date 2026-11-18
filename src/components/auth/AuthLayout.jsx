import Image from "next/image";

import { Logo } from "@/components/shared/Logo";

const WEDDING_IMAGE =
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop";

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-white shadow-card lg:grid-cols-2">
        <div className="relative hidden lg:block lg:min-h-[620px]">
          <Image
            src={WEDDING_IMAGE}
            alt="Wedding couple"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/10" />
          <div className="absolute inset-x-10 bottom-10 space-y-3 text-white">
            <p className="text-2xl font-semibold leading-snug">
              “Every love story deserves a perfect beginning.”
            </p>
            <p className="text-sm text-white/80">
              Find trusted wedding vendors for your big day — photography, venues, catering, decor
              and more, all in one place.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          {title && <h1 className="text-center text-2xl font-bold text-foreground">{title}</h1>}
          {subtitle && <p className="mb-6 text-center text-sm text-muted-foreground">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
