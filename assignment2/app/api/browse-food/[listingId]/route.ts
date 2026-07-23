import { NextRequest } from "next/server";

import {
  handleApiError,
  ok,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  browseDonationsQuerySchema,
} from "@/modules/donations/donation.schemas";

import {
  browseDonationsService,
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
      browseDonationsQuerySchema.parse(
        Object.fromEntries(
          request.nextUrl.searchParams.entries(),
        ),
      );

    const result =
      await browseDonationsService(
        user.id,
        query,
      );

    return ok(
      "Available donations retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}