"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";

export function VerificationNotice() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const verificationFailed =
    searchParams.get("verification") === "failed";

  if (!verificationFailed) {
    return null;
  }

  function dismissNotice() {
    router.replace("/", {
      scroll: false,
    });
  }

  return (
    <div className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-xl">
      <div
        role="alert"
        className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-[#FFF7ED] p-4 shadow-xl shadow-[#10271F]/10"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange-100 text-[#EA580C]">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-[#9A3412]">
            Code was not verified
          </p>

          <p className="mt-1 text-sm leading-6 text-[#B45309]">
            Your account has not been activated because the verification
            code was invalid, expired, or unavailable. Please register again
            or request a new code when resend functionality is added.
          </p>
        </div>

        <button
          type="button"
          onClick={dismissNotice}
          aria-label="Dismiss verification message"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-[#B45309] transition hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}