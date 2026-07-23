import "server-only";

import {
  DonationListingStatus,
  FoodItemStatus,
  type Prisma,
} from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
// import { prisma } from "@/lib/prisma";

const EXPIRY_WINDOW_DAYS = 7;
const DASHBOARD_ITEM_LIMIT = 5;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const dashboardFoodItemSelect = {
  id: true,
  itemName: true,
  quantity: true,
  unit: true,
  category: true,
  expiryDate: true,
  storageLocation: true,
  status: true,
  createdAt: true,
} satisfies Prisma.FoodItemSelect;

type DashboardFoodItemRecord =
  Prisma.FoodItemGetPayload<{
    select: typeof dashboardFoodItemSelect;
  }>;

function startOfCurrentUtcDay(): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);

  return date;
}

function getExpiryLimit(today: Date): Date {
  const expiryLimit = new Date(today);

  expiryLimit.setUTCDate(
    expiryLimit.getUTCDate() + EXPIRY_WINDOW_DAYS,
  );

  expiryLimit.setUTCHours(23, 59, 59, 999);

  return expiryLimit;
}

function getDaysUntilExpiry(
  expiryDate: Date,
  today: Date,
): number {
  const difference =
    expiryDate.getTime() - today.getTime();

  return Math.max(
    0,
    Math.ceil(difference / MILLISECONDS_PER_DAY),
  );
}

function mapDashboardFoodItem(
  item: DashboardFoodItemRecord,
  today: Date,
) {
  return {
    id: item.id,
    itemName: item.itemName,
    quantity: item.quantity.toString(),
    unit: item.unit,
    category: item.category,
    expiryDate: item.expiryDate.toISOString(),
    storageLocation: item.storageLocation,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    daysUntilExpiry: getDaysUntilExpiry(
      item.expiryDate,
      today,
    ),
  };
}

export async function getDashboardService(
  userId: string,
) {
  const today = startOfCurrentUtcDay();
  const expiryLimit = getExpiryLimit(today);

  const activeInventoryWhere: Prisma.FoodItemWhereInput = {
    userId,
    status: {
      in: [
        FoodItemStatus.AVAILABLE,
        FoodItemStatus.RESERVED,
      ],
    },
  };

  const expiringInventoryWhere: Prisma.FoodItemWhereInput = {
    ...activeInventoryWhere,
    expiryDate: {
      gte: today,
      lte: expiryLimit,
    },
  };

  const [
    totalFoodItems,
    expiringSoon,
    activeDonations,
    foodSaved,
    recentItems,
    expiringItems,
  ] = await prisma.$transaction([
    prisma.foodItem.count({
      where: activeInventoryWhere,
    }),

    prisma.foodItem.count({
      where: expiringInventoryWhere,
    }),

    prisma.donationListing.count({
      where: {
        donorId: userId,
        status: DonationListingStatus.AVAILABLE,
      },
    }),

    prisma.foodItem.count({
      where: {
        userId,
        status: FoodItemStatus.USED,
      },
    }),

    prisma.foodItem.findMany({
      where: activeInventoryWhere,
      select: dashboardFoodItemSelect,
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      take: DASHBOARD_ITEM_LIMIT,
    }),

    prisma.foodItem.findMany({
      where: expiringInventoryWhere,
      select: dashboardFoodItemSelect,
      orderBy: [
        {
          expiryDate: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
      take: DASHBOARD_ITEM_LIMIT,
    }),
  ]);

  return {
    expiryWindowDays: EXPIRY_WINDOW_DAYS,

    stats: {
      foodItems: totalFoodItems,
      expiringSoon,
      activeDonations,
      foodSaved,
    },

    recentItems: recentItems.map((item) =>
      mapDashboardFoodItem(item, today),
    ),

    expiringItems: expiringItems.map((item) =>
      mapDashboardFoodItem(item, today),
    ),
  };
}

export type DashboardData = Awaited<
  ReturnType<typeof getDashboardService>
>;