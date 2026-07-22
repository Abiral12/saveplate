import { NextRequest } from "next/server";

// import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  errorResponse,
  successResponse,
} from "@/modules/inventory/inventory.errors";

import {
  createInventoryItemSchema,
  inventoryQuerySchema,
} from "@/modules/inventory/inventory.schemas";

import {
  createInventoryItemService,
  getInventoryItemsService,
} from "@/modules/inventory/inventory.service";
import { requireApiUser } from "@/lib/auth/require-api-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const currentUser =
      await requireApiUser();

    const queryObject =
      Object.fromEntries(
        request.nextUrl.searchParams.entries(),
      );

    const query =
      inventoryQuerySchema.parse(
        queryObject,
      );

    const result =
      await getInventoryItemsService(
        currentUser.id,
        query,
      );

    return successResponse(
      "Inventory items retrieved successfully.",
      result,
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const currentUser =
      await requireApiUser();

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
      createInventoryItemSchema.parse(
        body,
      );

    const item =
      await createInventoryItemService(
        currentUser.id,
        input,
      );

    return successResponse(
      "Food item added successfully.",
      item,
      201,
    );
  } catch (error) {
    return errorResponse(error);
  }
}