"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: "current-password" | "new-password";
  error?: string;
  disabled?: boolean;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete = "current-password",
  error,
  disabled,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2.5">
      <Label htmlFor={id} className="text-sm font-bold text-[#17392D]">
        {label}
      </Label>

      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event: { target: { value: string; }; }) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-12 rounded-xl border-[#D7DED7] bg-white px-4 pr-12",
            "text-base text-[#10271F] shadow-none",
            "placeholder:text-[#6C7D75]/65",
            "focus-visible:border-[#10B981]",
            "focus-visible:ring-[#10B981]/15",
            error &&
              "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/10",
          )}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-[#52665D] transition hover:bg-[#EEF2EA] hover:text-[#065F46] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="size-[18px]" aria-hidden="true" />
          ) : (
            <Eye className="size-[18px]" aria-hidden="true" />
          )}
        </button>
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-red-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}