import {
  Suspense,
} from "react";

import type {
  Metadata,
} from "next";

import {
  AuthShell,
} from "@/components/auth/auth-shell";
import {
  RegisterForm,
} from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account | SavePlate",
  description:
    "Create a private SavePlate household account and start reducing food waste.",
};

function RegisterFormFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <p className="text-sm font-semibold text-[#718078]">
        Loading registration form...
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell mode="register">
      <Suspense
        fallback={<RegisterFormFallback />}
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}