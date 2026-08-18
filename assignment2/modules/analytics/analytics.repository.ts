import "server-only";

import {
  DonationListingStatus,
  FoodItemStatus,
  type Prisma,
} from "@/app/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const foodActivitySelect = {
  id: true,
  category: true,
  status: true,
  updatedAt: true,
} satisfies Prisma.FoodItemSelect;

const donationActivitySelect = {
  id: true,
  completedAt: true,
  foodItem: {
    select: {
      category: true,
    },
  },
} satisfies Prisma.DonationListingSelect;

export type FoodActivityRecord = Prisma.FoodItemGetPayload<{
  select: typeof foodActivitySelect;
}>;

export type DonationActivityRecord = Prisma.DonationListingGetPayload<{
  select: typeof donationActivitySelect;
}>;

export async function findAnalyticsFoodActivities(
  userId: string,
  from: Date,
  to: Date,
  category?: string,
) {
  return prisma.foodItem.findMany({
    where: {
      userId,
      status: {
        in: [FoodItemStatus.USED, FoodItemStatus.DISCARDED],
      },
      updatedAt: {
        gte: from,
        lte: to,
      },
      ...(category
        ? {
            category: {
              equals: category,
              mode: "insensitive",
            },
          }
        : {}),
    },
    select: foodActivitySelect,
    orderBy: {
      updatedAt: "asc",
    },
  });
}

export async function findAnalyticsDonationActivities(
  userId: string,
  from: Date,
  to: Date,
  category?: string,
) {
  return prisma.donationListing.findMany({
    where: {
      donorId: userId,
      status: DonationListingStatus.COMPLETED,
      completedAt: {
        gte: from,
        lte: to,
      },
      ...(category
        ? {
            foodItem: {
              category: {
                equals: category,
                mode: "insensitive",
              },
            },
          }
        : {}),
    },
    select: donationActivitySelect,
    orderBy: {
      completedAt: "asc",
    },
  });
}

export async function findAnalyticsCategories(userId: string) {
  const rows = await prisma.foodItem.findMany({
    where: {
      userId,
    },
    select: {
      category: true,
    },
    distinct: ["category"],
    orderBy: {
      category: "asc",
    },
  });

  return rows.map((row) => row.category);
}
