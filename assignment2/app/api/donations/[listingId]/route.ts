import { NextRequest } from "next/server";

import {
  handleApiError,
  ok,
  readJsonBody,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  updateDonationSchema,
  uuidSchema,
} from "@/modules/donations/donation.schemas";

import {
  getOwnDonationByIdService,
  updateDonationService,
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
      await getOwnDonationByIdService(
        user.id,
        uuidSchema.parse(
          listingId,
        ),
      );

    return ok(
      "Donation listing retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireApiUser();

    const { listingId } =
      await context.params;

    const input =
      updateDonationSchema.parse(
        await readJsonBody(request),
      );

    const result =
      await updateDonationService(
        user.id,
        uuidSchema.parse(
          listingId,
        ),
        input,
      );

    return ok(
      "Donation listing updated successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}