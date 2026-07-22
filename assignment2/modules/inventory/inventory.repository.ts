import { prisma } from "@/lib/db/prisma";

import {
  inventoryItemSelect,
} from "./inventory.mapper";

import type {
  InventoryQueryInput,
} from "./inventory.schemas";
import { FoodItemStatus, Prisma } from "@/app/generated/prisma/client";

function startOfTodayUtc(): Date {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );
}

function addDays(
  date: Date,
  days: number
): Date {
  const result = new Date(date);

  result.setUTCDate(
    result.getUTCDate() + days
  );

  return result;
}

function buildInventoryWhere(
  userId: string,
  query: InventoryQueryInput
): Prisma.FoodItemWhereInput {
  const where:
    Prisma.FoodItemWhereInput = {
      userId,
    };

  if (query.search) {
    where.OR = [
      {
        itemName: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        category: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        storageLocation: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        notes: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.category) {
    where.category = {
      equals: query.category,
      mode: "insensitive",
    };
  }

  if (query.storageLocation) {
    where.storageLocation = {
      equals:
        query.storageLocation,
      mode: "insensitive",
    };
  }

  if (query.status) {
    where.status =
      query.status as FoodItemStatus;
  }

  if (query.expiry) {
    const today =
      startOfTodayUtc();

    if (
      query.expiry === "expired"
    ) {
      where.expiryDate = {
        lt: today,
      };

      where.status =
        FoodItemStatus.AVAILABLE;
    }

    if (query.expiry === "soon") {
      where.expiryDate = {
        gte: today,
        lte: addDays(today, 7),
      };

      where.status =
        FoodItemStatus.AVAILABLE;
    }

    if (query.expiry === "future") {
      where.expiryDate = {
        gt: addDays(today, 7),
      };

      where.status =
        FoodItemStatus.AVAILABLE;
    }
  }

  return where;
}

function buildOrderBy(
  sortBy:
    InventoryQueryInput["sortBy"],
  sortDirection:
    InventoryQueryInput["sortDirection"]
): Prisma.FoodItemOrderByWithRelationInput[] {
  const primaryOrder:
    Prisma.FoodItemOrderByWithRelationInput =
    {
      [sortBy]: sortDirection,
    };

  return [
    primaryOrder,
    {
      id: "desc",
    },
  ];
}

export async function createInventoryItem(
  data: Prisma.FoodItemUncheckedCreateInput
) {
  return prisma.foodItem.create({
    data,
    select: inventoryItemSelect,
  });
}

export async function findInventoryItems(
  userId: string,
  query: InventoryQueryInput
) {
  const where =
    buildInventoryWhere(
      userId,
      query
    );

  const skip =
    (query.page - 1) * query.size;

  const orderBy =
    buildOrderBy(
      query.sortBy,
      query.sortDirection
    );

  const [items, total] =
    await prisma.$transaction([
      prisma.foodItem.findMany({
        where,
        select:
          inventoryItemSelect,
        orderBy,
        skip,
        take: query.size,
      }),

      prisma.foodItem.count({
        where,
      }),
    ]);

  return {
    items,
    total,
  };
}

export async function findInventoryItemById(
  itemId: string,
  userId: string
) {
  return prisma.foodItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
    select: inventoryItemSelect,
  });
}

export async function updateInventoryItem(
  itemId: string,
  data: Prisma.FoodItemUpdateInput
) {
  return prisma.foodItem.update({
    where: {
      id: itemId,
    },
    data,
    select: inventoryItemSelect,
  });
}

export async function deleteInventoryItem(
  itemId: string,
  userId: string
) {
  return prisma.foodItem.deleteMany({
    where: {
      id: itemId,
      userId,
    },
  });
}