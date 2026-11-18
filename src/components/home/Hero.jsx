"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1600&auto=format&fit=crop";

const STATS = [
  { value: "500+", label: "Verified Vendors" },
  { value: "1200+", label: "Weddings Planned" },
  { value: "4.9★", label: "Average Rating" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={HERO_IMAGE} alt="Wedding couple" fill priority sizes="100vw" className="object-cover" />
        {/* left white gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/10" />
      </div>

      <div className="container-page relative flex min-h-[560px] flex-col justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-xl space-y-6"
        >
          <span className="inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-primary">
            Your One-Stop Wedding Marketplace
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Plan Your Dream Wedding, All in One Place
          </h1>
          <p className="text-base leading-relaxed text-secondary-foreground sm:text-lg">
            Discover trusted photographers, venues, caterers, decorators and stylists — compare
            prices, check availability and book everything for your big day in minutes.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/services">
              Explore Wedding Services
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <div className="flex flex-wrap gap-x-10 gap-y-4 pt-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
