import { NextRequest } from "next/server";
import { z } from "zod";

import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  errorResponse,
  successResponse,
} from "@/modules/inventory/inventory.errors";

import {
  updateInventoryItemSchema,
} from "@/modules/inventory/inventory.schemas";

import {
  deleteInventoryItemService,
  getInventoryItemByIdService,
  updateInventoryItemService,
} from "@/modules/inventory/inventory.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const itemIdSchema = z
  .string()
  .uuid(
    "Food item ID must be a valid UUID.",
  );

type RouteContext = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const currentUser =
      await requireApiUser();

    const { itemId } =
      await context.params;

    const validatedItemId =
      itemIdSchema.parse(itemId);

    const item =
      await getInventoryItemByIdService(
        validatedItemId,
        currentUser.id,
      );

    return successResponse(
      "Food item retrieved successfully.",
      item,
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const currentUser =
      await requireApiUser();

    const { itemId } =
      await context.params;

    const validatedItemId =
      itemIdSchema.parse(itemId);

    const body = await request
      .json()
      .catch(() => null);

    if (!body) {
      return Response.json(
        {
          success: false,
          message:
            "The request body must contain valid JSON.",
        },
        {
          status: 400,
        },
      );
    }

    const input =
      updateInventoryItemSchema.parse(
        body,
      );

    const item =
      await updateInventoryItemService(
        validatedItemId,
        currentUser.id,
        input,
      );

    return successResponse(
      "Food item updated successfully.",
      item,
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const currentUser =
      await requireApiUser();

    const { itemId } =
      await context.params;

    const validatedItemId =
      itemIdSchema.parse(itemId);

    const result =
      await deleteInventoryItemService(
        validatedItemId,
        currentUser.id,
      );

    return successResponse(
      "Food item deleted successfully.",
      result,
    );
  } catch (error) {
    return errorResponse(error);
  }
}