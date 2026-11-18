"use client";

import { motion } from "framer-motion";
import { BadgeCheck, CalendarCheck, Headset, Tag } from "lucide-react";

import { Card } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: BadgeCheck,
    title: "Verified Vendors",
    description: "Every vendor is reviewed and approved by our team before going live, so you book with confidence.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    description: "Request a booking in a few clicks and track its status — accepted, pending or completed — from your dashboard.",
  },
  {
    icon: Tag,
    title: "Transparent Pricing",
    description: "Compare service prices upfront with clear USD pricing. No hidden charges, no surprises later.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    description: "Our wedding-support team is ready to help you with anything from choosing a vendor to planning your day.",
  },
];

export function WhyChoose() {
  return (
    <section className="container-page py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col items-center gap-2 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose WedPlan</h2>
        <p className="max-w-lg text-muted-foreground">
          Everything you need to plan the perfect wedding, without the stress.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <motion.div
            key={title}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <Card className="card-lift h-full p-6">
              <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
