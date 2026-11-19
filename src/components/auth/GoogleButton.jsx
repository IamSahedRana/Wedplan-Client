"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z"
      />
    </svg>
  );
}

export function GoogleButton({ callbackURL = "/dashboard", label = "Continue with Google" }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL });
      if (error) {
        toast.error(error.message || "Google sign-in failed");
        setLoading(false);
      }
    } catch {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full rounded-full"
      onClick={handleGoogle}
      disabled={loading}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : <GoogleIcon />}
      {label}
    </Button>
  );
}
