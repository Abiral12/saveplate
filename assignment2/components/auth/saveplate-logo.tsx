import Link from "next/link";
import { Leaf } from "lucide-react";

import { cn } from "@/lib/utils";

type SavePlateLogoProps = {
  className?: string;
  inverted?: boolean;
};

export function SavePlateLogo({
  className,
  inverted = false,
}: SavePlateLogoProps) {
  return (
    <Link
      href="/"
      aria-label="SavePlate home"
      className={cn(
        "inline-flex items-center gap-3 rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#BEF264] focus-visible:ring-offset-4",
        inverted && "focus-visible:ring-offset-[#052E24]",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-11 place-items-center rounded-2xl border shadow-sm",
          inverted
            ? "border-white/15 bg-white/10 text-[#BEF264]"
            : "border-[#065F46]/10 bg-[#065F46] text-[#BEF264]",
        )}
      >
        <Leaf className="size-5" aria-hidden="true" />
      </span>

      <span
        className={cn(
          "text-xl font-extrabold tracking-[-0.04em]",
          inverted ? "text-white" : "text-[#10271F]",
        )}
      >
        SavePlate
      </span>
    </Link>
  );
}