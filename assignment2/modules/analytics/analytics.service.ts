import "server-only";

import { FoodItemStatus } from "@/app/generated/prisma/client";
import type {
  AnalyticsCategory,
  AnalyticsPeriod,
  AnalyticsTrendPoint,
  FoodAnalyticsData,
} from "@/types/analytics";

import type { AnalyticsQueryInput } from "./analytics.schemas";
import {
  findAnalyticsCategories,
  findAnalyticsDonationActivities,
  findAnalyticsFoodActivities,
} from "./analytics.repository";

const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
};

const trendDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function endOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

function getTrendBucketDays(period: AnalyticsPeriod): number {
  if (period === "7d" || period === "30d") {
    return 1;
  }

  return 7;
}

function getBucketStart(date: Date, from: Date, bucketDays: number): Date {
  const millisecondsPerDay = 86_400_000;
  const dayOffset = Math.floor(
    (startOfUtcDay(date).getTime() - startOfUtcDay(from).getTime()) /
      millisecondsPerDay,
  );
  const bucketOffset = Math.floor(dayOffset / bucketDays) * bucketDays;
  const bucket = new Date(startOfUtcDay(from));
  bucket.setUTCDate(bucket.getUTCDate() + bucketOffset);
  return bucket;
}

function createTrend(
  period: AnalyticsPeriod,
  from: Date,
  to: Date,
  usedDates: Date[],
  donationDates: Date[],
  discardedDates: Date[],
): AnalyticsTrendPoint[] {
  const bucketDays = getTrendBucketDays(period);
  const points = new Map<string, AnalyticsTrendPoint>();

  for (let cursor = startOfUtcDay(from); cursor <= to; ) {
    const bucketStart = new Date(cursor);
    const key = bucketStart.toISOString().slice(0, 10);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setUTCDate(bucketEnd.getUTCDate() + bucketDays - 1);

    points.set(key, {
      key,
      label:
        bucketDays === 1
          ? trendDateFormatter.format(bucketStart)
          : `${trendDateFormatter.format(bucketStart)} – ${trendDateFormatter.format(
              bucketEnd > to ? to : bucketEnd,
            )}`,
      saved: 0,
      donated: 0,
      discarded: 0,
    });

    cursor = new Date(cursor);
    cursor.setUTCDate(cursor.getUTCDate() + bucketDays);
  }

  const add = (
    date: Date,
    field: "saved" | "donated" | "discarded",
  ) => {
    const bucketStart = getBucketStart(date, from, bucketDays);
    const point = points.get(bucketStart.toISOString().slice(0, 10));

    if (point) {
      point[field] += 1;
    }
  };

  usedDates.forEach((date) => add(date, "saved"));
  donationDates.forEach((date) => {
    add(date, "saved");
    add(date, "donated");
  });
  discardedDates.forEach((date) => add(date, "discarded"));

  return Array.from(points.values());
}

export async function getFoodAnalyticsService(
  userId: string,
  query: AnalyticsQueryInput,
): Promise<FoodAnalyticsData> {
  const today = new Date();
  const to = endOfUtcDay(today);
  const periodDays = PERIOD_DAYS[query.period];
  const from = startOfUtcDay(subtractDays(today, periodDays - 1));

  const [foodActivities, donationActivities, categories] = await Promise.all([
    findAnalyticsFoodActivities(userId, from, to, query.category),
    findAnalyticsDonationActivities(userId, from, to, query.category),
    findAnalyticsCategories(userId),
  ]);

  const usedItems = foodActivities.filter(
    (item) => item.status === FoodItemStatus.USED,
  );
  const discardedItems = foodActivities.filter(
    (item) => item.status === FoodItemStatus.DISCARDED,
  );

  const donationsCompleted = donationActivities.length;
  const foodSaved = usedItems.length + donationsCompleted;
  const foodDiscarded = discardedItems.length;
  const resolvedItems = foodSaved + foodDiscarded;
  const wasteReductionRate =
    resolvedItems === 0
      ? 0
      : Number(((foodSaved / resolvedItems) * 100).toFixed(1));

  const categoryMap = new Map<string, AnalyticsCategory>();

  function ensureCategory(category: string): AnalyticsCategory {
    const existing = categoryMap.get(category);
    if (existing) {
      return existing;
    }

    const created: AnalyticsCategory = {
      category,
      saved: 0,
      discarded: 0,
      total: 0,
    };
    categoryMap.set(category, created);
    return created;
  }

  for (const item of foodActivities) {
    const row = ensureCategory(item.category);
    if (item.status === FoodItemStatus.USED) {
      row.saved += 1;
    } else if (item.status === FoodItemStatus.DISCARDED) {
      row.discarded += 1;
    }
    row.total += 1;
  }

  for (const donation of donationActivities) {
    const row = ensureCategory(donation.foodItem.category);
    row.saved += 1;
    row.total += 1;
  }

  return {
    period: {
      type: query.period,
      from: from.toISOString(),
      to: to.toISOString(),
    },
    selectedCategory: query.category ?? null,
    categories,
    summary: {
      foodSaved,
      itemsUsed: usedItems.length,
      donationsCompleted,
      foodDiscarded,
      wasteReductionRate,
    },
    outcomes: [
      {
        status: "USED",
        label: "Used before waste",
        count: usedItems.length,
      },
      {
        status: "DONATED",
        label: "Donated",
        count: donationsCompleted,
      },
      {
        status: "DISCARDED",
        label: "Discarded",
        count: foodDiscarded,
      },
    ],
    categoryBreakdown: Array.from(categoryMap.values()).sort(
      (a, b) => b.total - a.total || a.category.localeCompare(b.category),
    ),
    trend: createTrend(
      query.period,
      from,
      to,
      usedItems.map((item) => item.updatedAt),
      donationActivities
        .map((item) => item.completedAt)
        .filter((date): date is Date => date !== null),
      discardedItems.map((item) => item.updatedAt),
    ),
    hasActivity: resolvedItems > 0,
  };
}
