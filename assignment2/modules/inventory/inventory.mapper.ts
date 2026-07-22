// import {
//   prisma,
// } from "@prisma/client";

import { Prisma } from "@/app/generated/prisma/client";

export const inventoryItemSelect = {
  id: true,
  itemName: true,
  quantity: true,
  unit: true,
  expiryDate: true,
  category: true,
  storageLocation: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FoodItemSelect;

export type InventoryItemRecord =
  Prisma.FoodItemGetPayload<{
    select: typeof inventoryItemSelect;
  }>;

const MILLISECONDS_PER_DAY =
  1000 * 60 * 60 * 24;

function normalizeDateOnly(
  value: Date
): number {
  return Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate()
  );
}

export function getDaysUntilExpiry(
  expiryDate: Date
): number {
  const today = new Date();

  const todayTimestamp =
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );

  const expiryTimestamp =
    normalizeDateOnly(expiryDate);

  return Math.ceil(
    (expiryTimestamp - todayTimestamp) /
      MILLISECONDS_PER_DAY
  );
}

export function mapInventoryItem(
  item: InventoryItemRecord
) {
  const daysUntilExpiry =
    getDaysUntilExpiry(
      item.expiryDate
    );

  const isAvailable =
    item.status === "AVAILABLE";

  return {
    id: item.id,
    itemName: item.itemName,
    quantity: Number(item.quantity),
    unit: item.unit,
    expiryDate:
      item.expiryDate
        .toISOString()
        .slice(0, 10),
    category: item.category,
    storageLocation:
      item.storageLocation,
    status: item.status,
    notes: item.notes,
    createdAt:
      item.createdAt.toISOString(),
    updatedAt:
      item.updatedAt.toISOString(),

    isExpired:
      isAvailable &&
      daysUntilExpiry < 0,

    isExpiringSoon:
      isAvailable &&
      daysUntilExpiry >= 0 &&
      daysUntilExpiry <= 7,

    daysUntilExpiry,
  };
}