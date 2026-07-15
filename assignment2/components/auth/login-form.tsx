"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postAuthRequest } from "@/lib/api/auth-client";
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validation/auth";
import { cn } from "@/lib/utils";

type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>;

type LoginResponseData = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
};

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

function firstError(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function LoginForm() {
  const router = useRouter();

  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
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

    const result = loginSchema.safeParse(values);

    if (!result.success) {
      const flattenedErrors = result.error.flatten().fieldErrors;

      setFieldErrors({
        email: flattenedErrors.email?.[0],
        password: flattenedErrors.password?.[0],
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const { body } = await postAuthRequest<
        LoginResponseData,
        LoginFormValues
      >("/api/auth/login", {
        email: result.data.email.toLowerCase(),
        password: result.data.password,
      });

      if (!body.success) {
        setFieldErrors({
          email: firstError(body.errors?.email),
          password: firstError(body.errors?.password),
        });

        setFormError(body.message || "Unable to log in.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError(
        "We could not reach SavePlate. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const emailErrorId = "login-email-error";

  return (
    <div>
      <header>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#0C8A63]">
          Household access
        </p>

        <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-[#10271F] sm:text-[2.75rem]">
          Welcome back
        </h2>

        <p className="mt-3 max-w-md text-base leading-7 text-[#617269]">
          Log in to check what is available, what needs attention, and what
          your household has already saved.
        </p>
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

        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-sm font-bold text-[#17392D]">
            Email address
          </Label>

          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-[#6B7C73]"
              aria-hidden="true"
            />

            <Input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event: { target: { value: string; }; }) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? emailErrorId : undefined}
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
              id={emailErrorId}
              role="alert"
              className="text-sm font-medium text-red-600"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={values.password}
          onChange={(value) => updateField("password", value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          error={fieldErrors.password}
          disabled={isSubmitting}
        />

        <div className="flex items-center gap-2 rounded-xl bg-[#F1F4EE] px-3.5 py-3 text-xs leading-5 text-[#617269]">
          <LockKeyhole
            className="size-4 shrink-0 text-[#0C8A63]"
            aria-hidden="true"
          />

          Your session will be stored in a secure HTTP-only cookie.
        </div>

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
              Logging in...
            </>
          ) : (
            <>
              Log in
              <ArrowRight className="size-5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-[#617269]">
        New to SavePlate?{" "}
        <Link
          href="/register"
          className="font-extrabold text-[#065F46] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/30"
        >
          Create your household account
        </Link>
      </p>
    </div>
  );
}