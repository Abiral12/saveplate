import { NextRequest } from "next/server";

import {
  handleApiError,
  ok,
  readJsonBody,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  donationRequestActionSchema,
  uuidSchema,
} from "@/modules/donations/donation.schemas";

import {
  performDonationRequestActionService,
} from "@/modules/donations/donation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user =
      await requireApiUser();

    const { requestId } =
      await context.params;

    const input =
      donationRequestActionSchema.parse(
        await readJsonBody(request),
      );

    const result =
      await performDonationRequestActionService(
        user.id,
        uuidSchema.parse(
          requestId,
        ),
        input,
      );

    return ok(
      "Donation request updated successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}