"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { CategoryCard } from "@/components/shared/CategoryCard";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

const CATEGORIES = [
  "Photography & Videography",
  "Wedding Venues",
  "Decoration & Florist",
  "Catering Services",
  "Makeup & Styling",
  "Wedding Fashion",
];

export function CategoryGrid() {
  const [state, setState] = useState({ loading: true, error: null, counts: {} });

  const load = () => {
    setState({ loading: true, error: null, counts: {} });
    api
      .get("/services/category-counts")
      .then((data) => {
        const counts = {};
        for (const item of data.items || []) counts[item.category] = item.count;
        setState({ loading: false, error: null, counts });
      })
      .catch((err) => setState({ loading: false, error: err.message || "Failed to load categories", counts: {} }));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="bg-muted py-20">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col items-center gap-2 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse by Category</h2>
          <p className="max-w-lg text-muted-foreground">
            Whatever your wedding needs, find the perfect vendor in the category you are looking for.
          </p>
        </motion.div>

        {state.loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : state.error ? (
          <ErrorState title="Couldn't load categories" message={state.error} onRetry={load} />
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {CATEGORIES.map((category) => (
              <CategoryCard key={category} category={category} count={state.counts[category] || 0} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
