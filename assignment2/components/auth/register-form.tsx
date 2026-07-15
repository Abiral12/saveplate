"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Home,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { PasswordField } from "@/components/auth/password-field";
import { PasswordStrength } from "@/components/auth/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postAuthRequest } from "@/lib/api/auth-client";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

type RegisterFieldErrors = Partial<
  Record<keyof RegisterFormValues, string>
>;

type RegisterPayload = {
  fullName: string;
  email: string;
  householdSize?: number;
  password: string;
};

type RegisterResponseData = {
  userId: string;
  email: string;
  verificationRequired: boolean;
};

const initialValues: RegisterFormValues = {
  fullName: "",
  email: "",
  householdSize: "",
  password: "",
  confirmPassword: "",
};

function firstError(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function RegisterForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

const emailVerified = searchParams.get("verified") === "true";

  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const result = registerSchema.safeParse(values);

    if (!result.success) {
      const flattenedErrors = result.error.flatten().fieldErrors;

      setFieldErrors({
        fullName: flattenedErrors.fullName?.[0],
        email: flattenedErrors.email?.[0],
        householdSize: flattenedErrors.householdSize?.[0],
        password: flattenedErrors.password?.[0],
        confirmPassword: flattenedErrors.confirmPassword?.[0],
      });

      return;
    }

    const payload: RegisterPayload = {
      fullName: result.data.fullName.trim(),
      email: result.data.email.toLowerCase(),
      password: result.data.password,
      householdSize: result.data.householdSize
        ? Number(result.data.householdSize)
        : undefined,
    };

    setIsSubmitting(true);

    try {
      const { body } = await postAuthRequest<
        RegisterResponseData,
        RegisterPayload
      >("/api/auth/register", payload);

      if (!body.success) {
        setFieldErrors({
          fullName: firstError(body.errors?.fullName),
          email: firstError(body.errors?.email),
          householdSize: firstError(body.errors?.householdSize),
          password: firstError(body.errors?.password),
        });

        setFormError(body.message || "Unable to create your account.");
        return;
      }

      router.replace(
  `/verify-email?email=${encodeURIComponent(payload.email)}`,
);
    } catch {
      setFormError(
        "We could not reach SavePlate. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const errorIds = {
    fullName: "register-full-name-error",
    email: "register-email-error",
    householdSize: "register-household-size-error",
  };

  return (
    <div>
      <header>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0C8A63]">
          Private household account
        </p>

        <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-[#10271F] sm:text-[2.75rem]">
          Create your SavePlate
        </h2>

        <p className="mt-3 max-w-md text-base leading-7 text-[#617269]">
          Build a clear picture of your household food and receive a six-digit
          email code to activate your account.
        </p>
      </header>

      {emailVerified ? (
  <div
    role="status"
    className="flex items-start gap-3 rounded-xl border border-[#A7E8C3] bg-[#ECFDF3] px-4 py-3.5 text-[#065F46]"
  >
    <BadgeCheck
      className="mt-0.5 size-5 shrink-0"
      aria-hidden="true"
    />

    <div>
      <p className="text-sm font-extrabold">
        Email verified successfully
      </p>

      <p className="mt-1 text-sm leading-6 text-[#28745C]">
        Your account is now active. You can log in using your email
        address and password.
      </p>
    </div>
  </div>
) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
          >
            {formError}
          </div>
        ) : null}

        <div className="space-y-2.5">
          <Label
            htmlFor="fullName"
            className="text-sm font-bold text-[#17392D]"
          >
            Full name
          </Label>

          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6B7C73]"
              aria-hidden="true"
            />

            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={values.fullName}
              onChange={(event: { target: { value: string; }; }) =>
                updateField("fullName", event.target.value)
              }
              placeholder="Your full name"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={
                fieldErrors.fullName ? errorIds.fullName : undefined
              }
              className={cn(
                "h-12 rounded-xl border-[#D7DED7] bg-white pl-11 pr-4",
                "text-base text-[#10271F] shadow-none",
                "placeholder:text-[#6C7D75]/65",
                "focus-visible:border-[#10B981]",
                "focus-visible:ring-[#10B981]/15",
                fieldErrors.fullName &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10",
              )}
            />
          </div>

          {fieldErrors.fullName ? (
            <p
              id={errorIds.fullName}
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {fieldErrors.fullName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <Label
            htmlFor="registerEmail"
            className="text-sm font-bold text-[#17392D]"
          >
            Email address
          </Label>

          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6B7C73]"
              aria-hidden="true"
            />

            <Input
              id="registerEmail"
              name="email"
              type="email"
              value={values.email}
              onChange={(event: { target: { value: string; }; }) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? errorIds.email : undefined
              }
              className={cn(
                "h-12 rounded-xl border-[#D7DED7] bg-white pl-11 pr-4",
                "text-base text-[#10271F] shadow-none",
                "placeholder:text-[#6C7D75]/65",
                "focus-visible:border-[#10B981]",
                "focus-visible:ring-[#10B981]/15",
                fieldErrors.email &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10",
              )}
            />
          </div>

          {fieldErrors.email ? (
            <p
              id={errorIds.email}
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label
              htmlFor="householdSize"
              className="text-sm font-bold text-[#17392D]"
            >
              Household size
            </Label>

            <span className="text-xs font-medium text-[#76867E]">
              Optional
            </span>
          </div>

          <div className="relative">
            <Home
              className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6B7C73]"
              aria-hidden="true"
            />

            <Input
              id="householdSize"
              name="householdSize"
              type="number"
              min={1}
              max={30}
              step={1}
              value={values.householdSize}
              onChange={(event: { target: { value: string; }; }) =>
                updateField("householdSize", event.target.value)
              }
              placeholder="e.g. 4"
              inputMode="numeric"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.householdSize)}
              aria-describedby={
                fieldErrors.householdSize
                  ? errorIds.householdSize
                  : undefined
              }
              className={cn(
                "h-12 rounded-xl border-[#D7DED7] bg-white pl-11 pr-4",
                "text-base text-[#10271F] shadow-none",
                "placeholder:text-[#6C7D75]/65",
                "focus-visible:border-[#10B981]",
                "focus-visible:ring-[#10B981]/15",
                fieldErrors.householdSize &&
                  "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10",
              )}
            />
          </div>

          {fieldErrors.householdSize ? (
            <p
              id={errorIds.householdSize}
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {fieldErrors.householdSize}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={values.password}
          onChange={(value) => updateField("password", value)}
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={fieldErrors.password}
          disabled={isSubmitting}
        />

        <PasswordStrength password={values.password} />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          value={values.confirmPassword}
          onChange={(value) => updateField("confirmPassword", value)}
          placeholder="Enter the same password again"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
        />

        <p className="text-xs leading-5 text-[#708078]">
          By creating an account, you agree to use SavePlate responsibly. Your
          inventory remains private until you publish a donation listing.
        </p>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-xl bg-[#065F46] text-base font-extrabold text-white shadow-lg shadow-[#065F46]/15 transition hover:bg-[#054C39] focus-visible:ring-[#10B981]/35 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                className="size-5 animate-spin"
                aria-hidden="true"
              />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="size-5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-[#617269]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-extrabold text-[#065F46] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/30"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}