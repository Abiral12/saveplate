import { NextRequest } from "next/server";

import {
  handleApiError,
  ok,
  readJsonBody,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  createDonationSchema,
  ownDonationsQuerySchema,
} from "@/modules/donations/donation.schemas";

import {
  createDonationService,
  getOwnDonationsService,
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
      ownDonationsQuerySchema.parse(
        Object.fromEntries(
          request.nextUrl.searchParams.entries(),
        ),
      );

    const result =
      await getOwnDonationsService(
        user.id,
        query,
      );

    return ok(
      "Donation listings retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const user =
      await requireApiUser();

    const input =
      createDonationSchema.parse(
        await readJsonBody(request),
      );

    const result =
      await createDonationService(
        user.id,
        input,
      );

    return ok(
      "Donation listing created successfully.",
      result,
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}