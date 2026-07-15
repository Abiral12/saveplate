import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  HandHeart,
  Leaf,
  Package,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
  iconClassName: string;
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClassName,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-[#DFE6DE] bg-white p-5 shadow-sm shadow-[#10271F]/[0.03]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#6C7D75]">
            {label}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-[#10271F]">
            {value}
          </p>
        </div>

        <span
          className={cn(
            "grid size-11 place-items-center rounded-2xl",
            iconClassName,
          )}
        >
          <Icon className="size-5" aria-hidden={true} />
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold leading-5 text-[#829087]">
        {description}
      </p>
    </article>
  );
}

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  const firstName =
    user.fullName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 py-6 sm:px-7 sm:py-8 xl:px-10">
      <section className="relative overflow-hidden rounded-[28px] bg-[#052E24] px-6 py-8 text-white shadow-xl shadow-[#052E24]/10 sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-[#BEF264]/15 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 left-1/3 size-80 rounded-full bg-[#10B981]/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#DFFFAF]">
              <Sparkles className="size-4" aria-hidden={true} />
              Your household overview
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.055em] sm:text-5xl">
              Welcome back, {firstName}.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Your SavePlate account is ready. Add household food
              items to begin monitoring expiry dates and reducing
              unnecessary waste.
            </p>
          </div>

          <Link
            href="/inventory/new"
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BEF264] px-5 text-sm font-extrabold text-[#052E24] shadow-lg shadow-black/10 transition hover:bg-[#D0FF82] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Plus className="size-5" aria-hidden={true} />
            Add food item
          </Link>
        </div>
      </section>

      <section
        aria-label="Household food summary"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Food items"
          value="0"
          description="No inventory items recorded yet."
          icon={Package}
          iconClassName="bg-[#E8F8EE] text-[#087554]"
        />

        <StatCard
          label="Expiring soon"
          value="0"
          description="Items expiring within the alert period."
          icon={Clock3}
          iconClassName="bg-[#FFF1E6] text-[#EA580C]"
        />

        <StatCard
          label="Active donations"
          value="0"
          description="Food currently available to the community."
          icon={HandHeart}
          iconClassName="bg-[#EEF7D9] text-[#527417]"
        />

        <StatCard
          label="Food saved"
          value="0"
          description="Items marked as used before going to waste."
          icon={Leaf}
          iconClassName="bg-[#E7F3F0] text-[#065F46]"
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.55fr)]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03] sm:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
                  Inventory
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#10271F]">
                  Your kitchen is ready to organise
                </h2>
              </div>

              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#065F46] hover:underline hover:underline-offset-4"
              >
                View inventory
                <ArrowRight className="size-4" aria-hidden={true} />
              </Link>
            </div>

            <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-[#C9D8CA] bg-[#F7F9F4] px-6 py-12 text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-[#E6F7EC] text-[#065F46]">
                <Package className="size-8" aria-hidden={true} />
              </span>

              <h3 className="mt-5 text-xl font-extrabold text-[#10271F]">
                No food items yet
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-[#6C7D75]">
                Add what is currently in your pantry, refrigerator,
                or freezer. SavePlate will later help you identify
                which items should be used first.
              </p>

              <Link
                href="/inventory/new"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white transition hover:bg-[#054C39]"
              >
                <Plus className="size-4" aria-hidden={true} />
                Add your first item
              </Link>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#EA580C]">
                  Expiry attention
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">
                  Expiring soon
                </h2>
              </div>

              <span className="grid size-11 place-items-center rounded-2xl bg-[#FFF1E6] text-[#EA580C]">
                <Clock3 className="size-5" aria-hidden={true} />
              </span>
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl bg-[#FFF7ED] p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#EA580C] shadow-sm">
                <Check className="size-5" aria-hidden={true} />
              </span>

              <div>
                <p className="font-extrabold text-[#9A3412]">
                  Nothing requires attention
                </p>

                <p className="mt-1 text-sm leading-6 text-[#B45309]">
                  Expiry alerts will appear here after food items
                  have been added.
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03]">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
              Account setup
            </p>

            <h2 className="mt-2 text-xl font-extrabold tracking-[-0.035em]">
              Start your food-saving journey
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#DDF8E8] text-[#087554]">
                  <Check className="size-4" aria-hidden={true} />
                </span>

                <div>
                  <p className="text-sm font-extrabold">
                    Account verified
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#728078]">
                    Your email address is confirmed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#D4DDD4] bg-[#F5F7F3] text-xs font-extrabold text-[#6C7D75]">
                  2
                </span>

                <div>
                  <p className="text-sm font-extrabold">
                    Add your first food item
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#728078]">
                    Record an item and its expiry date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#D4DDD4] bg-[#F5F7F3] text-xs font-extrabold text-[#6C7D75]">
                  3
                </span>

                <div>
                  <p className="text-sm font-extrabold">
                    Review privacy settings
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#728078]">
                    Decide what donation information may be shown.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] bg-[#EAF5DF] p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#527417] shadow-sm">
              <UsersRound className="size-5" aria-hidden={true} />
            </span>

            <h2 className="mt-5 text-xl font-extrabold tracking-[-0.035em] text-[#243D19]">
              Household profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#567047]">
              Household size helps SavePlate provide more useful
              inventory and food-saving insights.
            </p>

            <div className="mt-5 rounded-xl bg-white/70 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#718265]">
                Members
              </p>

              <p className="mt-1 text-2xl font-extrabold text-[#243D19]">
                {user.householdSize ?? "Not set"}
              </p>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03]">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#E7F3F0] text-[#065F46]">
                <ShieldCheck className="size-5" aria-hidden={true} />
              </span>

              <div>
                <p className="font-extrabold">Private by default</p>
                <p className="text-xs text-[#738179]">
                  Household inventory is protected
                </p>
              </div>
            </div>

            <Link
              href="/settings/privacy"
              className="mt-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-[#CBD8CE] text-sm font-extrabold text-[#065F46] transition hover:bg-[#F4F8F2]"
            >
              Review privacy settings
              <ArrowRight className="size-4" aria-hidden={true} />
            </Link>
          </section>

          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 opacity-75 shadow-sm shadow-[#10271F]/[0.03]">
            <div className="flex items-center gap-3">
              <CalendarDays
                className="size-5 text-[#065F46]"
                aria-hidden={true}
              />

              <h2 className="font-extrabold">Weekly meal plan</h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#6C7D75]">
              Meal planning will be introduced during Iteration 2.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}