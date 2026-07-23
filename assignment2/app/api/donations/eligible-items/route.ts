import {
  handleApiError,
  ok,
} from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";

import {
  getEligibleDonationItemsService,
} from "@/modules/donations/donation.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user =
      await requireApiUser();

    const result =
      await getEligibleDonationItemsService(
        user.id,
      );

    return ok(
      "Eligible food items retrieved successfully.",
      result,
    );
  } catch (error) {
    return handleApiError(error);
  }
}