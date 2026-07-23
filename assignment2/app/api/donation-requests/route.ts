import { NextRequest } from "next/server";

import {
  handleApiError,
  ok,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  myRequestsQuerySchema,
} from "@/modules/donations/donation.schemas";

import {
  getMyRequestsService,
} from "@/modules/donations/donation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const user =
      await requireApiUser();

    const query =
      myRequestsQuerySchema.parse(
        Object.fromEntries(
          request.nextUrl.searchParams.entries(),
        ),
      );

    const result =
      await getMyRequestsService(
        user.id,
        query,
      );

    return ok(
      "Donation requests retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}