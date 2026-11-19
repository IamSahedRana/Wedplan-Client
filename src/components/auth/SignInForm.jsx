"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { dashboardPathFor, safeRedirect } from "@/lib/redirect";

const schema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values) {
    setAuthError(null);
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        const message = error.message || "Failed to sign in";
        setAuthError(message);
        toast.error(message);
        return;
      }

      toast.success(`Welcome back${data?.user?.name ? `, ${data.user.name}` : ""}!`);
      router.replace(safeRedirect(searchParams.get("redirect")) || dashboardPathFor(data?.user?.role));
    } catch (err) {
      const message = err.message || "Failed to sign in";
      setAuthError(message);
      toast.error(message);
    }
  }

  return (
    <AuthLayout title="Sign In" subtitle="Welcome back to WedPlan">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {authError && (
          <div className="rounded-xl bg-error-tint px-4 py-3 text-sm font-medium text-error" role="alert">
            {authError}
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
              autoComplete="current-password"
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
        </div>

        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
          {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
          Sign In
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton callbackURL={safeRedirect(searchParams.get("redirect")) || "/dashboard"} />
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to WedPlan?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
