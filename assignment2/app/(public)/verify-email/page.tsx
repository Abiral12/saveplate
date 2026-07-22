import { Suspense } from "react";
import type { Metadata } from "next";
import { LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verify email | SavePlate",
  description:
    "Verify your email address to activate your SavePlate household account.",
};

function VerifyEmailFallback() {
  return (
    <div className="flex min-h-80 items-center justify-center">
      <div className="text-center">
        <LoaderCircle
          className="mx-auto size-8 animate-spin text-[#065F46]"
          aria-hidden="true"
        />

        <p className="mt-4 text-sm font-semibold text-[#617269]">
          Preparing email verification...
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthShell mode="verify">
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}