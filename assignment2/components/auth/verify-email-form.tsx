"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { postAuthRequest } from "@/lib/api/auth-client";
import { verifyEmailSchema } from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

type VerifyEmailPayload = {
  email: string;
  code: string;
};

type VerifyEmailResponseData = {
  userId: string;
  fullName?: string;
  email: string;
  verified?: boolean;
  alreadyVerified?: boolean;
};

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeInputRef = useRef<HTMLInputElement>(null);

  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!email) {
      router.replace("/?verification=failed");
      return;
    }

    codeInputRef.current?.focus();
  }, [email, router]);

  function handleCodeChange(event: ChangeEvent<HTMLInputElement>) {
    const numericCode = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setCode(numericCode);
    setCodeError(null);
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCodeError(null);
    setFormError(null);

    if (!email) {
      router.replace("/?verification=failed");
      return;
    }

    const validationResult = verifyEmailSchema.safeParse({
      code,
    });

    if (!validationResult.success) {
      setCodeError(
        validationResult.error.flatten().fieldErrors.code?.[0] ??
          "Enter the complete six-digit verification code.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const { body } = await postAuthRequest<
        VerifyEmailResponseData,
        VerifyEmailPayload
      >("/api/auth/verify-email", {
        email,
        code: validationResult.data.code,
      });

      if (!body.success) {
        /*
         * Requested behaviour:
         * Any rejected verification code sends the user back
         * to the landing page.
         */
        router.replace("/?verification=failed");
        return;
      }

      /*
       * Use replace so the Back button does not return the user
       * to a verification page containing an already-used code.
       */
      router.replace("/login?verified=true");
    } catch {
      /*
       * A network failure does not prove that the code was wrong.
       * Keep the user on this page and allow another attempt.
       */
      setFormError(
        "We could not verify your code because SavePlate could not be reached. Check your connection and try again.",
      );

      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <header>
        <span className="mb-6 grid size-14 place-items-center rounded-2xl bg-[#E4F8EC] text-[#065F46]">
          <MailCheck className="size-7" aria-hidden="true" />
        </span>

        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0C8A63]">
          Email verification
        </p>

        <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-[#10271F] sm:text-[2.75rem]">
          Check your inbox
        </h2>

        <p className="mt-3 max-w-md text-base leading-7 text-[#617269]">
          We sent a six-digit verification code to:
        </p>

        <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-[#DCE6DE] bg-white px-4 py-2.5 text-sm font-bold text-[#065F46] shadow-sm">
          <MailCheck className="size-4 shrink-0" aria-hidden="true" />

          <span className="truncate">{email || "Unknown email address"}</span>
        </div>
      </header>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
          >
            {formError}
          </div>
        ) : null}

        <div className="space-y-3">
          <label
            htmlFor="verificationCode"
            className="block text-sm font-bold text-[#17392D]"
          >
            Six-digit verification code
          </label>

          <input
            ref={codeInputRef}
            id="verificationCode"
            name="verificationCode"
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            disabled={isSubmitting}
            aria-invalid={Boolean(codeError)}
            aria-describedby={
              codeError
                ? "verification-code-error"
                : "verification-code-help"
            }
            className={cn(
              "h-16 w-full rounded-2xl border bg-white px-4 text-center",
              "font-mono text-3xl font-extrabold tracking-[0.45em]",
              "text-[#10271F] outline-none transition",
              "placeholder:text-[#9CAB9F]/50",
              "border-[#D7DED7]",
              "focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/10",
              "disabled:cursor-not-allowed disabled:opacity-60",
              codeError &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/10",
            )}
          />

          {codeError ? (
            <p
              id="verification-code-error"
              role="alert"
              className="text-sm font-semibold text-red-600"
            >
              {codeError}
            </p>
          ) : (
            <p
              id="verification-code-help"
              className="text-sm leading-6 text-[#708078]"
            >
              Enter the most recent code. Each code expires after the
              configured verification period.
            </p>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-[#DCE6DE] bg-[#F1F5EE] px-4 py-3.5">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-[#0C8A63]"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-bold text-[#17392D]">
              Account protection
            </p>

            <p className="mt-1 text-xs leading-5 text-[#617269]">
              Your account remains inactive until this email address is
              successfully verified.
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || code.length !== 6 || !email}
          className="h-12 w-full rounded-xl bg-[#065F46] text-base font-extrabold text-white shadow-lg shadow-[#065F46]/15 transition hover:bg-[#054C39] focus-visible:ring-[#10B981]/35 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                className="size-5 animate-spin"
                aria-hidden="true"
              />
              Verifying email...
            </>
          ) : (
            <>
              Verify email
              <ArrowRight className="size-5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-[#DCE3DC] pt-6 text-sm sm:flex-row">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 font-bold text-[#617269] transition hover:text-[#065F46]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Use another email
        </Link>

        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#7A8981]">
          <CheckCircle2 className="size-4 text-[#10B981]" aria-hidden="true" />
          Secure six-digit verification
        </span>
      </div>
    </div>
  );
}