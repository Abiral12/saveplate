import Link from "next/link";
import { headers } from "next/headers";
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

type DashboardItem = {
  id: string;
  itemName: string;
  quantity: string;
  unit: string;
  category: string;
  expiryDate: string;
  storageLocation: string | null;
  status: string;
  createdAt: string;
  daysUntilExpiry: number;
};

type DashboardData = {
  expiryWindowDays: number;

  stats: {
    foodItems: number;
    expiringSoon: number;
    activeDonations: number;
    foodSaved: number;
  };

  recentItems: DashboardItem[];
  expiringItems: DashboardItem[];
};

type DashboardApiResponse = {
  success: boolean;
  message: string;
  data?: DashboardData;
};

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

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return dateFormatter.format(date);
}

function getExpiryLabel(daysUntilExpiry: number): string {
  if (daysUntilExpiry <= 0) {
    return "Expires today";
  }

  if (daysUntilExpiry === 1) {
    return "1 day left";
  }

  return `${daysUntilExpiry} days left`;
}

function getFoodItemsDescription(total: number): string {
  if (total === 0) {
    return "No active inventory items recorded yet.";
  }

  if (total === 1) {
    return "1 active item in your household inventory.";
  }

  return `${total} active items in your household inventory.`;
}

function getExpiringDescription(
  total: number,
  expiryWindowDays: number,
): string {
  if (total === 0) {
    return `No items expire within ${expiryWindowDays} days.`;
  }

  if (total === 1) {
    return `1 item expires within ${expiryWindowDays} days.`;
  }

  return `${total} items expire within ${expiryWindowDays} days.`;
}

function getDonationDescription(total: number): string {
  if (total === 0) {
    return "No food is currently available for donation.";
  }

  if (total === 1) {
    return "1 donation listing is available to the community.";
  }

  return `${total} donation listings are available to the community.`;
}

function getFoodSavedDescription(total: number): string {
  if (total === 0) {
    return "No food items have been marked as used yet.";
  }

  if (total === 1) {
    return "1 item was used before going to waste.";
  }

  return `${total} items were used before going to waste.`;
}

async function getDashboardData(): Promise<DashboardData> {
  const requestHeaders = await headers();

  const forwardedHost =
    requestHeaders.get("x-forwarded-host");

  const host = (
    forwardedHost ??
    requestHeaders.get("host")
  )
    ?.split(",")[0]
    ?.trim();

  if (!host) {
    throw new Error(
      "Unable to determine the application host.",
    );
  }

  const protocol = (
    requestHeaders.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development"
      ? "http"
      : "https")
  )
    .split(",")[0]
    .trim();

  const cookieHeader =
    requestHeaders.get("cookie") ?? "";

  const response = await fetch(
    `${protocol}://${host}/api/dashboard`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    },
  );

  const payload = (await response
    .json()
    .catch(() => null)) as DashboardApiResponse | null;

  if (
    !response.ok ||
    !payload?.success ||
    !payload.data
  ) {
    throw new Error(
      payload?.message ??
        "Dashboard data could not be loaded.",
    );
  }

  return payload.data;
}

export default async function DashboardPage() {
  const [user, dashboard] = await Promise.all([
    requireCurrentUser(),
    getDashboardData(),
  ]);

  const {
    stats,
    recentItems,
    expiringItems,
    expiryWindowDays,
  } = dashboard;

  const firstName =
    user.fullName.trim().split(/\s+/)[0] || "there";

  const hasInventory = stats.foodItems > 0;

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
              <Sparkles
                className="size-4"
                aria-hidden={true}
              />
              Your household overview
            </div>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-[-0.055em] sm:text-5xl">
              Welcome back, {firstName}.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              {hasInventory
                ? `You currently have ${stats.foodItems} ${
                    stats.foodItems === 1
                      ? "food item"
                      : "food items"
                  } in your household inventory. Review what should be used next and reduce unnecessary waste.`
                : "Your SavePlate account is ready. Add household food items to begin monitoring expiry dates and reducing unnecessary waste."}
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
          value={stats.foodItems.toLocaleString()}
          description={getFoodItemsDescription(
            stats.foodItems,
          )}
          icon={Package}
          iconClassName="bg-[#E8F8EE] text-[#087554]"
        />

        <StatCard
          label="Expiring soon"
          value={stats.expiringSoon.toLocaleString()}
          description={getExpiringDescription(
            stats.expiringSoon,
            expiryWindowDays,
          )}
          icon={Clock3}
          iconClassName="bg-[#FFF1E6] text-[#EA580C]"
        />

        <StatCard
          label="Active donations"
          value={stats.activeDonations.toLocaleString()}
          description={getDonationDescription(
            stats.activeDonations,
          )}
          icon={HandHeart}
          iconClassName="bg-[#EEF7D9] text-[#527417]"
        />

        <StatCard
          label="Food saved"
          value={stats.foodSaved.toLocaleString()}
          description={getFoodSavedDescription(
            stats.foodSaved,
          )}
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
                  {recentItems.length > 0
                    ? "Recently added food"
                    : "Your kitchen is ready to organise"}
                </h2>

                {recentItems.length > 0 && (
                  <p className="mt-2 text-sm font-medium leading-6 text-[#6C7D75]">
                    Your latest household inventory items.
                  </p>
                )}
              </div>

              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 text-sm font-extrabold text-[#065F46] hover:underline hover:underline-offset-4"
              >
                View inventory
                <ArrowRight
                  className="size-4"
                  aria-hidden={true}
                />
              </Link>
            </div>

            {recentItems.length === 0 ? (
              <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-[#C9D8CA] bg-[#F7F9F4] px-6 py-12 text-center">
                <span className="grid size-16 place-items-center rounded-2xl bg-[#E6F7EC] text-[#065F46]">
                  <Package
                    className="size-8"
                    aria-hidden={true}
                  />
                </span>

                <h3 className="mt-5 text-xl font-extrabold text-[#10271F]">
                  No food items yet
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#6C7D75]">
                  Add what is currently in your pantry,
                  refrigerator, or freezer. SavePlate will
                  help you identify which items should be
                  used first.
                </p>

                <Link
                  href="/inventory/new"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#065F46] px-5 text-sm font-extrabold text-white transition hover:bg-[#054C39]"
                >
                  <Plus
                    className="size-4"
                    aria-hidden={true}
                  />
                  Add your first item
                </Link>
              </div>
            ) : (
              <div className="mt-7 overflow-hidden rounded-2xl border border-[#DFE6DE]">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/inventory/${item.id}`}
                    className="group flex items-center justify-between gap-4 border-b border-[#E7ECE7] px-4 py-4 transition last:border-b-0 hover:bg-[#F7F9F4] sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#E8F8EE] text-[#087554]">
                        <Package
                          className="size-5"
                          aria-hidden={true}
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#10271F]">
                          {item.itemName}
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-[#728078]">
                          {item.quantity} {item.unit}
                          {" · "}
                          {item.category}
                          {item.storageLocation
                            ? ` · ${item.storageLocation}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="hidden text-right sm:block">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#87928C]">
                          Expires
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#065F46]">
                          {formatDate(item.expiryDate)}
                        </p>
                      </div>

                      <ArrowRight
                        className="size-4 text-[#91A098] transition group-hover:translate-x-0.5 group-hover:text-[#065F46]"
                        aria-hidden={true}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03] sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#EA580C]">
                  Expiry attention
                </p>

                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[#10271F]">
                  Expiring soon
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-[#6C7D75]">
                  Items expiring within the next{" "}
                  {expiryWindowDays} days.
                </p>
              </div>

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#FFF1E6] text-[#EA580C]">
                <Clock3
                  className="size-5"
                  aria-hidden={true}
                />
              </span>
            </div>

            {expiringItems.length === 0 ? (
              <div className="mt-6 flex items-start gap-4 rounded-2xl bg-[#FFF7ED] p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#EA580C] shadow-sm">
                  <Check
                    className="size-5"
                    aria-hidden={true}
                  />
                </span>

                <div>
                  <p className="font-extrabold text-[#9A3412]">
                    Nothing requires attention
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#B45309]">
                    No active inventory items expire within
                    the next {expiryWindowDays} days.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {expiringItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/inventory/${item.id}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4 transition hover:border-[#FDBA74] hover:bg-[#FFF3E5]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#EA580C] shadow-sm">
                        <Clock3
                          className="size-5"
                          aria-hidden={true}
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#9A3412]">
                          {item.itemName}
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-[#B45309]">
                          {item.quantity} {item.unit}
                          {" · "}
                          {item.storageLocation ??
                            item.category}
                          {" · "}
                          {formatDate(item.expiryDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#EA580C] shadow-sm">
                        {getExpiryLabel(
                          item.daysUntilExpiry,
                        )}
                      </span>

                      <ArrowRight
                        className="hidden size-4 text-[#EA580C] transition group-hover:translate-x-0.5 sm:block"
                        aria-hidden={true}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 shadow-sm shadow-[#10271F]/[0.03]">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0C8A63]">
              Account setup
            </p>

            <h2 className="mt-2 text-xl font-extrabold tracking-[-0.035em] text-[#10271F]">
              Start your food-saving journey
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#DDF8E8] text-[#087554]">
                  <Check
                    className="size-4"
                    aria-hidden={true}
                  />
                </span>

                <div>
                  <p className="text-sm font-extrabold text-[#10271F]">
                    Account verified
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#728078]">
                    Your email address is confirmed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full",
                    hasInventory
                      ? "bg-[#DDF8E8] text-[#087554]"
                      : "border border-[#D4DDD4] bg-[#F5F7F3] text-xs font-extrabold text-[#6C7D75]",
                  )}
                >
                  {hasInventory ? (
                    <Check
                      className="size-4"
                      aria-hidden={true}
                    />
                  ) : (
                    "2"
                  )}
                </span>

                <div>
                  <p className="text-sm font-extrabold text-[#10271F]">
                    Add your first food item
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#728078]">
                    {hasInventory
                      ? "Your household inventory has been started."
                      : "Record an item and its expiry date."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#D4DDD4] bg-[#F5F7F3] text-xs font-extrabold text-[#6C7D75]">
                  3
                </span>

                <div>
                  <p className="text-sm font-extrabold text-[#10271F]">
                    Review privacy settings
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#728078]">
                    Decide what donation information may be
                    shown.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] bg-[#EAF5DF] p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#527417] shadow-sm">
              <UsersRound
                className="size-5"
                aria-hidden={true}
              />
            </span>

            <h2 className="mt-5 text-xl font-extrabold tracking-[-0.035em] text-[#243D19]">
              Household profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#567047]">
              Household size helps SavePlate provide more
              useful inventory and food-saving insights.
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
                <ShieldCheck
                  className="size-5"
                  aria-hidden={true}
                />
              </span>

              <div>
                <p className="font-extrabold text-[#10271F]">
                  Private by default
                </p>

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
              <ArrowRight
                className="size-4"
                aria-hidden={true}
              />
            </Link>
          </section>

          <section className="rounded-[24px] border border-[#DFE6DE] bg-white p-6 opacity-75 shadow-sm shadow-[#10271F]/[0.03]">
            <div className="flex items-center gap-3">
              <CalendarDays
                className="size-5 text-[#065F46]"
                aria-hidden={true}
              />

              <h2 className="font-extrabold text-[#10271F]">
                Weekly meal plan
              </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#6C7D75]">
              Meal planning will be introduced during
              Iteration 2.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}