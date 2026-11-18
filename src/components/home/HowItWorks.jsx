"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    title: "Browse Services",
    description: "Explore verified vendors across photography, venues, catering, decor, styling and fashion.",
  },
  {
    title: "Compare & Shortlist",
    description: "Check photos, prices and locations. Filter and sort until you find the perfect match.",
  },
  {
    title: "Book Your Date",
    description: "Send a booking request with your event date and location, then track its status live.",
  },
  {
    title: "Enjoy Your Day",
    description: "Sit back and enjoy — your vendor handles the rest while you make memories.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted py-20">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col items-center gap-2 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How WedPlan Works</h2>
          <p className="max-w-lg text-muted-foreground">
            From first browse to final booking — planning your wedding takes just four steps.
          </p>
        </motion.div>

        <motion.ol
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="relative grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
        >
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="relative flex flex-col items-center gap-3 text-center"
            >
              <span className="z-10 flex size-14 items-center justify-center rounded-full border-4 border-muted bg-primary text-lg font-bold text-white shadow-card">
                {i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className="absolute top-7 hidden h-0.5 w-full bg-border lg:block" aria-hidden="true" />
              )}
              <h3 className="font-semibold text-foreground">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
