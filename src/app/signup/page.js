import { Suspense } from "react";

import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata = { title: "Sign Up — WedPlan" };

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
