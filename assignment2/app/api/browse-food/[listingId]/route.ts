import { NextRequest } from "next/server";

import {
  handleApiError,
  ok,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  uuidSchema,
} from "@/modules/donations/donation.schemas";

import {
  getBrowseDonationByIdService,
} from "@/modules/donations/donation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    listingId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireApiUser();

    const { listingId } =
      await context.params;

    const result =
      await getBrowseDonationByIdService(
        user.id,
        uuidSchema.parse(
          listingId,
        ),
      );

    return ok(
      "Donation details retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}