// import { FoodItemStatus, Prisma } from "@/app/generated/prisma/client";
import { FoodItemStatus, Prisma } from "@/app/generated/prisma/client";
import { ApiError } from "./inventory.errors";

import {
  mapInventoryItem,
} from "./inventory.mapper";

import {
  createInventoryItem,
  deleteInventoryItem,
  findInventoryItemById,
  findInventoryItems,
  updateInventoryItem,
} from "./inventory.repository";

import type {
  CreateInventoryItemInput,
  InventoryQueryInput,
  UpdateInventoryItemInput,
} from "./inventory.schemas";

function parseDateOnly(
  date: string
): Date {
  return new Date(
    `${date}T00:00:00.000Z`
  );
}

function normalizeCategory(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeSimpleText(
  value: string
): string {
  return value
    .trim()
    .replace(/\s+/g, " ");
}

export async function createInventoryItemService(
  userId: string,
  input: CreateInventoryItemInput
) {
  const item =
    await createInventoryItem({
      userId,
      itemName:
        normalizeSimpleText(
          input.itemName
        ),
      quantity:
        new Prisma.Decimal(
          input.quantity
        ),
      unit:
        normalizeSimpleText(
          input.unit
        ),
      expiryDate:
        parseDateOnly(
          input.expiryDate
        ),
      category:
        normalizeCategory(
          input.category
        ),
      storageLocation:
        input.storageLocation
          ? normalizeSimpleText(
              input.storageLocation
            )
          : null,
      notes:
        input.notes ?? null,
      status:
        FoodItemStatus.AVAILABLE,
    });

  return mapInventoryItem(item);
}

export async function getInventoryItemsService(
  userId: string,
  query: InventoryQueryInput
) {
  const result =
    await findInventoryItems(
      userId,
      query
    );

  const totalPages =
    result.total === 0
      ? 0
      : Math.ceil(
          result.total /
            query.size
        );

  return {
    items:
      result.items.map(
        mapInventoryItem
      ),

    pagination: {
      page: query.page,
      size: query.size,
      totalItems: result.total,
      totalPages,
      hasNext:
        query.page < totalPages,
      hasPrevious:
        query.page > 1,
    },
  };
}

export async function getInventoryItemByIdService(
  itemId: string,
  userId: string
) {
  const item =
    await findInventoryItemById(
      itemId,
      userId
    );

  if (!item) {
    throw new ApiError(
      404,
      "Food item was not found."
    );
  }

  return mapInventoryItem(item);
}

export async function updateInventoryItemService(
  itemId: string,
  userId: string,
  input: UpdateInventoryItemInput
) {
  const existingItem =
    await findInventoryItemById(
      itemId,
      userId
    );

  if (!existingItem) {
    throw new ApiError(
      404,
      "Food item was not found."
    );
  }

  if (
    existingItem.status ===
      FoodItemStatus.DONATED ||
    existingItem.status ===
      FoodItemStatus.RESERVED
  ) {
    throw new ApiError(
      409,
      "This item cannot be updated while it is donated or reserved."
    );
  }

  const updateData:
    Prisma.FoodItemUpdateInput = {};

  if (
    input.itemName !== undefined
  ) {
    updateData.itemName =
      normalizeSimpleText(
        input.itemName
      );
  }

  if (
    input.quantity !== undefined
  ) {
    updateData.quantity =
      new Prisma.Decimal(
        input.quantity
      );
  }

  if (input.unit !== undefined) {
    updateData.unit =
      normalizeSimpleText(
        input.unit
      );
  }

  if (
    input.expiryDate !== undefined
  ) {
    updateData.expiryDate =
      parseDateOnly(
        input.expiryDate
      );
  }

  if (
    input.category !== undefined
  ) {
    updateData.category =
      normalizeCategory(
        input.category
      );
  }

  if (
    input.storageLocation !==
    undefined
  ) {
    updateData.storageLocation =
      input.storageLocation
        ? normalizeSimpleText(
            input.storageLocation
          )
        : null;
  }

  if (input.notes !== undefined) {
    updateData.notes =
      input.notes;
  }

  if (input.status !== undefined) {
    updateData.status =
      input.status;
  }

  const updatedItem =
    await updateInventoryItem(
      itemId,
      updateData
    );

  return mapInventoryItem(
    updatedItem
  );
}

export async function deleteInventoryItemService(
  itemId: string,
  userId: string
) {
  const existingItem =
    await findInventoryItemById(
      itemId,
      userId
    );

  if (!existingItem) {
    throw new ApiError(
      404,
      "Food item was not found."
    );
  }

  if (
    existingItem.status ===
      FoodItemStatus.DONATED ||
    existingItem.status ===
      FoodItemStatus.RESERVED
  ) {
    throw new ApiError(
      409,
      "A donated or reserved item cannot be deleted."
    );
  }

  const result =
    await deleteInventoryItem(
      itemId,
      userId
    );

  if (result.count === 0) {
    throw new ApiError(
      404,
      "Food item was not found."
    );
  }

  return {
    id: itemId,
  };
}