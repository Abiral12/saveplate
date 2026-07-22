import { Suspense } from "react";
import type { Metadata } from "next";
import { LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in | SavePlate",
  description:
    "Log in to manage your household food and reduce unnecessary waste.",
};

function LoginFormFallback() {
  return (
    <div className="flex min-h-80 items-center justify-center">
      <LoaderCircle
        className="size-8 animate-spin text-[#065F46]"
        aria-hidden="true"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}