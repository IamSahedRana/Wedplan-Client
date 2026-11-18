"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Store, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dashboardPathFor } from "@/lib/redirect";
import { cn } from "@/lib/utils";

const schema = z.object({
  role: z.enum(["customer", "vendor"]),
  businessName: z.string().max(80, "Business name is too long").optional(),
});

const ROLE_OPTIONS = [
  {
    value: "customer",
    icon: UserRound,
    title: "Customer",
    description: "Find and book wedding services",
  },
  {
    value: "vendor",
    icon: Store,
    title: "Vendor",
    description: "Offer your wedding services",
  },
];

export function OnboardingForm({ user }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: user.role || "",
      businessName: user.businessName || "",
    },
  });

  const role = watch("role");

  async function onSubmit(values) {
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Onboarding failed");
      toast.success("You're all set — welcome to WedPlan!");
      router.replace(dashboardPathFor(data.role));
    } catch (err) {
      toast.error(err.message || "Onboarding failed");
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
      <Card className="w-full max-w-lg p-8 shadow-card">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-bold text-foreground">Almost there, {user.name?.split(" ")[0]}!</h1>
          <p className="text-sm text-muted-foreground">
            Tell us how you plan to use WedPlan — you can only choose this once.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label>I want to</Label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map(({ value, icon: Icon, title, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("role", value, { shouldValidate: true })}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-4 text-center transition",
                    role === value
                      ? "border-primary bg-accent/50 ring-1 ring-primary"
                      : "border-border hover:border-primary/50 hover:bg-muted/60"
                  )}
                >
                  <Icon className={cn("size-5", role === value ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-sm font-semibold">{title}</span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs font-medium text-error">{errors.role.message}</p>}
          </div>

          {role === "vendor" && (
            <div className="space-y-2">
              <Label htmlFor="businessName">
                Business Name <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input id="businessName" placeholder="e.g. Rose & Vows Studio" {...register("businessName")} />
              {errors.businessName && (
                <p className="text-xs font-medium text-error">{errors.businessName.message}</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={isSubmitting || !role}>
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            Continue to Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}
