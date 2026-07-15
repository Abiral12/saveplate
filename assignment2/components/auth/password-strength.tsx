import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

type PasswordStrengthProps = {
  password: string;
};

const passwordChecks = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "Upper and lowercase letters",
    test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value),
  },
  {
    label: "At least one number",
    test: (value: string) => /\d/.test(value),
  },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const passedCount = passwordChecks.filter(({ test }) =>
    test(password),
  ).length;

  return (
    <div className="rounded-xl border border-[#DDE5DC] bg-[#F4F7F1] p-3.5">
      <div className="mb-3 flex gap-1.5" aria-hidden="true">
        {passwordChecks.map((check, index) => (
          <span
            key={check.label}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-[#D7DED7] transition-colors",
              index < passedCount && "bg-[#10B981]",
            )}
          />
        ))}
      </div>

      <ul className="grid gap-1.5 sm:grid-cols-2">
        {passwordChecks.map(({ label, test }) => {
          const passed = test(password);
          const Icon = passed ? Check : Circle;

          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold",
                passed ? "text-[#065F46]" : "text-[#6A7B73]",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}