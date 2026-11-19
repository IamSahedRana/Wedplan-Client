"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, LoaderCircle, Store, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { dashboardPathFor, safeRedirect } from "@/lib/redirect";
import { cn } from "@/lib/utils";

const schema = z.object({
  role: z.string().min(1, "Choose a role"),
  name: z.string().min(2, "Name is required").max(60, "Name is too long"),
  email: z.email("Enter a valid email"),
  password: z
    .string()
    .min(6, "At least 6 characters")
    .regex(/[A-Z]/, "Add an uppercase letter")
    .regex(/[a-z]/, "Add a lowercase letter"),
  businessName: z.string().max(80, "Business name is too long").optional(),
  image: z.string().optional(),
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

const PASSWORD_RULES = [
  { label: "At least 6 characters", test: (p) => p.length >= 6 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
];

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "", name: "", email: "", password: "", businessName: "", image: "" },
  });

  const role = watch("role");
  const password = watch("password");
  const image = watch("image");

  async function onSubmit(values) {
    setAuthError(null);
    try {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        role: values.role,
        image: values.image || undefined,
        businessName: values.role === "vendor" && values.businessName ? values.businessName : undefined,
      });

      if (error) {
        const message = error.message || "Failed to create account";
        setAuthError(message);
        toast.error(message);
        return;
      }

      toast.success("Account created — welcome to WedPlan!");
      router.replace(safeRedirect(searchParams.get("redirect")) || dashboardPathFor(data?.user?.role));
    } catch (err) {
      const message = err.message || "Failed to create account";
      setAuthError(message);
      toast.error(message);
    }
  }

  return (
    <AuthLayout title="Sign Up" subtitle="Create your WedPlan account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {authError && (
          <div className="rounded-xl bg-error-tint px-4 py-3 text-sm font-medium text-error" role="alert">
            {authError}
          </div>
        )}

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

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Your name" autoComplete="name" {...register("name")} />
          {errors.name && <p className="text-xs font-medium text-error">{errors.name.message}</p>}
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

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs font-medium text-error">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="new-password"
              className="pe-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-error">{errors.password.message}</p>}
          <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {PASSWORD_RULES.map(({ label, test }) => {
              const ok = password ? test(password) : false;
              return (
                <li
                  key={label}
                  className={cn("flex items-center gap-1 text-xs", ok ? "text-success" : "text-muted-foreground")}
                >
                  {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  {label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-2">
          <Label>
            Profile Image <span className="text-xs text-muted-foreground">(optional)</span>
          </Label>
          <ImageUploader
            value={image ? [image] : []}
            onChange={(urls) => setValue("image", urls[0] || "", { shouldValidate: false })}
          />
        </div>

        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
          Create Account
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton
          label="Sign up with Google"
          callbackURL={safeRedirect(searchParams.get("redirect")) || "/dashboard"}
        />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
