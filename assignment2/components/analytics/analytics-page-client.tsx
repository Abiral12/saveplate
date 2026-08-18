"use client";

import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  HandHeart,
  Leaf,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/types/api";
import type {
  AnalyticsPeriod,
  FoodAnalyticsData,
} from "@/types/analytics";

const PERIOD_OPTIONS: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 3 months" },
  { value: "180d", label: "Last 6 months" },
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-[#DFE6DE] bg-white p-4 shadow-sm shadow-[#10271F]/[0.03] sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-sm font-bold text-[#6C7D75]">{label}</p>
          <p className="mt-2 break-words text-2xl font-extrabold tracking-[-0.05em] text-[#10271F] sm:mt-3 sm:text-3xl">
            {value}
          </p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#EFFBD4] text-[#285A2C] sm:size-11">
          <Icon className="size-5" aria-hidden={true} />
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold leading-5 text-[#829087]">
        {description}
      </p>
    </article>
  );
}

export function AnalyticsPageClient() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");
  const [category, setCategory] = useState("");
  const [data, setData] = useState<FoodAnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      setLoading(true);
      try {
        const parameters = new URLSearchParams({ period });
        if (category) {
          parameters.set("category", category);
        }

        const response = await fetch(`/api/analytics?${parameters.toString()}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as ApiResponse<FoodAnalyticsData>;

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to load food analytics.");
        }

        if (!controller.signal.aborted) {
          setData(result.data);
          setError(null);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load food analytics.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [period, category, refreshKey]);

  const maxTrendValue = useMemo(() => {
    if (!data) return 1;
    return Math.max(
      1,
      ...data.trend.map((point) => point.saved + point.discarded),
    );
  }, [data]);

  const maxCategoryValue = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, ...data.categoryBreakdown.map((row) => row.total));
  }, [data]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1500px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-[22px] bg-[#052E24] px-4 py-5 text-white shadow-xl shadow-[#052E24]/10 sm:rounded-[28px] sm:px-8 sm:py-7">
        <div className="flex min-w-0 flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#BEF264] sm:text-sm sm:tracking-[0.16em]">
              <TrendingUp className="size-4" aria-hidden={true} />
              Track My Impact
            </div>
            <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] sm:text-4xl">
              Food Analytics
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/65 sm:text-[15px]">
              See how much food you saved, donated and prevented from going to waste.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
            <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/60">
              Time period
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
                className="h-11 w-full min-w-0 rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-bold text-white outline-none focus:border-[#BEF264] sm:min-w-40"
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="text-[#10271F]">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid min-w-0 gap-1.5 text-xs font-bold text-white/60">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-11 w-full min-w-0 rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-bold text-white outline-none focus:border-[#BEF264] sm:min-w-44"
              >
                <option value="" className="text-[#10271F]">All categories</option>
                {(data?.categories ?? []).map((item) => (
                  <option key={item} value={item} className="text-[#10271F]">
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>

      {error ? (
        <section className="mt-4 flex flex-col items-stretch gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 font-bold sm:w-auto"
          >
            <RefreshCw className="size-4" aria-hidden={true} /> Retry
          </button>
        </section>
      ) : null}

      {loading && !data ? (
        <div className="grid min-h-80 place-items-center">
          <div className="text-center text-[#6C7D75]">
            <LoaderCircle className="mx-auto size-8 animate-spin" aria-hidden={true} />
            <p className="mt-3 text-sm font-bold">Loading your impact...</p>
          </div>
        </div>
      ) : data ? (
        <>
          <div className="mt-5 flex min-w-0 flex-wrap items-center gap-2 text-xs font-bold text-[#829087] sm:mt-6">
            <CalendarDays className="size-4" aria-hidden={true} />
            {formatDate(data.period.from)} – {formatDate(data.period.to)}
            {data.selectedCategory ? (
              <span className="max-w-full truncate rounded-full bg-[#EEF2ED] px-2.5 py-1 text-[#426052]">
                {data.selectedCategory}
              </span>
            ) : null}
          </div>

          <section className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            <SummaryCard
              label="Food saved"
              value={String(data.summary.foodSaved)}
              description="Items used or successfully donated instead of wasted."
              icon={Leaf}
            />
            <SummaryCard
              label="Donations completed"
              value={String(data.summary.donationsCompleted)}
              description="Donation listings successfully completed for the community."
              icon={HandHeart}
            />
            <SummaryCard
              label="Food discarded"
              value={String(data.summary.foodDiscarded)}
              description="Items recorded as discarded during the selected period."
              icon={Trash2}
            />
            <SummaryCard
              label="Waste reduction rate"
              value={`${data.summary.wasteReductionRate}%`}
              description="Share of resolved food items that were saved from waste."
              icon={CheckCircle2}
            />
          </section>

          {!data.hasActivity ? (
            <section className="mt-6 rounded-3xl border border-dashed border-[#CAD6CC] bg-white px-4 py-9 text-center sm:px-6 sm:py-12">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#EFFBD4] text-[#285A2C]">
                <Leaf className="size-7" aria-hidden={true} />
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-[#10271F]">No food-saving activity yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-[#718078]">
                Start logging food, mark items as used, or complete a donation to see your impact and progress here.
              </p>
            </section>
          ) : (
            <section className="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
              <article className="min-w-0 overflow-hidden rounded-3xl border border-[#DFE6DE] bg-white p-4 sm:p-6">
                <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7A897F]">Progress over time</p>
                    <h2 className="mt-2 text-xl font-extrabold text-[#10271F]">Food saved vs discarded</h2>
                  </div>
                  <BarChart3 className="size-5 shrink-0 text-[#4E6D5B]" aria-hidden={true} />
                </div>

                <div className="mt-6 w-full overflow-x-auto pb-2 sm:mt-8">
                  <div
                    className="flex h-64 min-w-max items-end gap-2 border-b border-[#E7ECE7] pb-2 sm:min-w-full"
                    style={{ minWidth: `${Math.max(data.trend.length * 52, 320)}px` }}
                  >
                  {data.trend.map((point) => {
                    const savedHeight = Math.max(4, (point.saved / maxTrendValue) * 190);
                    const discardedHeight = Math.max(4, (point.discarded / maxTrendValue) * 190);
                    return (
                      <div key={point.key} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2 sm:min-w-14">
                        <div className="flex h-[200px] items-end gap-1">
                          <div
                            title={`${point.saved} saved`}
                            className="w-3 rounded-t-md bg-[#7CB342] sm:w-4"
                            style={{ height: `${savedHeight}px` }}
                          />
                          <div
                            title={`${point.discarded} discarded`}
                            className="w-3 rounded-t-md bg-[#D5DDD6] sm:w-4"
                            style={{ height: `${discardedHeight}px` }}
                          />
                        </div>
                        <span className="max-w-16 text-center text-[9px] font-bold leading-4 text-[#819087] sm:max-w-20 sm:text-[10px]">{point.label}</span>
                      </div>
                    );
                  })}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-[#66766D] sm:mt-4 sm:gap-4">
                  <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#7CB342]" /> Saved</span>
                  <span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#D5DDD6]" /> Discarded</span>
                </div>
              </article>

              <article className="min-w-0 overflow-hidden rounded-3xl border border-[#DFE6DE] bg-white p-4 sm:p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7A897F]">Food outcomes</p>
                <h2 className="mt-2 text-xl font-extrabold text-[#10271F]">Where your food went</h2>
                <div className="mt-6 space-y-5">
                  {data.outcomes.map((outcome) => {
                    const total = Math.max(1, data.outcomes.reduce((sum, row) => sum + row.count, 0));
                    const percent = (outcome.count / total) * 100;
                    return (
                      <div key={outcome.status}>
                        <div className="flex items-center justify-between gap-4 text-sm font-bold">
                          <span className="text-[#405449]">{outcome.label}</span>
                          <span className="text-[#10271F]">{outcome.count}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF2ED]">
                          <div className="h-full rounded-full bg-[#7CB342]" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-7 rounded-2xl bg-[#F6F9F5] p-4">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="size-5 text-[#4F6E5B]" aria-hidden={true} />
                    <div>
                      <p className="text-sm font-extrabold text-[#10271F]">{data.summary.itemsUsed} items used</p>
                      <p className="mt-1 text-xs font-semibold text-[#7D8A82]">Consumed before they became waste.</p>
                    </div>
                  </div>
                </div>
              </article>
            </section>
          )}

          {data.categoryBreakdown.length > 0 ? (
            <section className="mt-6 min-w-0 overflow-hidden rounded-3xl border border-[#DFE6DE] bg-white p-4 sm:p-6">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7A897F]">Category breakdown</p>
                <h2 className="mt-2 text-xl font-extrabold text-[#10271F]">Impact by food category</h2>
              </div>
              <div className="mt-6 space-y-4">
                {data.categoryBreakdown.map((row) => (
                  <div key={row.category} className="grid min-w-0 gap-2 sm:grid-cols-[minmax(110px,150px)_minmax(0,1fr)] sm:items-center sm:gap-4 lg:grid-cols-[150px_minmax(0,1fr)_auto]">
                    <span className="min-w-0 break-words text-sm font-bold text-[#42554A] sm:truncate">{row.category}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-[#EEF2ED]">
                      <div className="h-full rounded-full bg-[#7CB342]" style={{ width: `${(row.total / maxCategoryValue) * 100}%` }} />
                    </div>
                    <span className="text-xs font-extrabold text-[#65756C] sm:col-span-2 lg:col-span-1 lg:whitespace-nowrap">{row.saved} saved · {row.discarded} discarded</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}