import { NextRequest } from "next/server";

import {
  handleApiError,
  ok,
  readJsonBody,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  createDonationRequestSchema,
  uuidSchema,
} from "@/modules/donations/donation.schemas";

import {
  createDonationRequestService,
} from "@/modules/donations/donation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    listingId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireApiUser();

    const { listingId } =
      await context.params;

    const input =
      createDonationRequestSchema.parse(
        await readJsonBody(request),
      );

    const result =
      await createDonationRequestService(
        user.id,
        uuidSchema.parse(
          listingId,
        ),
        input,
      );

    return ok(
      "Donation request submitted successfully.",
      result,
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}