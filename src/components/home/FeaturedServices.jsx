"use client";

import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { ServiceGridSkeleton } from "@/components/shared/ServiceCardSkeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function FeaturedServices() {
  const [state, setState] = useState({ loading: true, error: null, items: [] });

  const load = useCallback(() => {
    setState({ loading: true, error: null, items: [] });
    api
      .get("/services?limit=6&sort=newest")
      .then((data) => setState({ loading: false, error: null, items: data.items || [] }))
      .catch((err) => setState({ loading: false, error: err.message || "Failed to load services", items: [] }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="container-page py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col items-center gap-2 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Wedding Services</h2>
        <p className="max-w-lg text-muted-foreground">
          Hand-picked vendors loved by couples — from photography and venues to catering and decor.
        </p>
      </motion.div>

      {state.loading ? (
        <ServiceGridSkeleton count={6} />
      ) : state.error ? (
        <ErrorState title="Couldn't load services" message={state.error} onRetry={load} />
      ) : state.items.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Approved services from our vendors will appear here soon."
        />
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {state.items.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </motion.div>
      )}

      <div className="mt-10 text-center">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/services">
            <RefreshCcw className="size-4" />
            View All Services
          </Link>
        </Button>
      </div>
    </section>
  );
}
