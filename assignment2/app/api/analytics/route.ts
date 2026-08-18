import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { analyticsQuerySchema } from "@/modules/analytics/analytics.schemas";
import { getFoodAnalyticsService } from "@/modules/analytics/analytics.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const url = new URL(request.url);

    const query = analyticsQuerySchema.parse({
      period: url.searchParams.get("period") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
    });

    const analytics = await getFoodAnalyticsService(user.id, query);

    return NextResponse.json(
      {
        success: true,
        message: "Food analytics retrieved successfully.",
        data: analytics,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
