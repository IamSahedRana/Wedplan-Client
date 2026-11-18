"use client";

import { motion } from "framer-motion";
import { ArrowRight, Store } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function VendorCta() {
  return (
    <section className="container-page py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center sm:px-16"
      >
        <div className="mx-auto max-w-2xl space-y-5 text-white">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-white/15">
            <Store className="size-6" />
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Are You a Wedding Vendor?</h2>
          <p className="text-white/85">
            Reach thousands of couples planning their big day. Publish your services, manage booking
            requests and grow your business — free to start, upgrade to Premium for unlimited
            services and promotion.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-full bg-white text-primary hover:bg-white/90">
            <Link href="/signup">
              Start Selling with WedPlan
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
