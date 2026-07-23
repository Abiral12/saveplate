import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { getDashboardService } from "@/modules/dashboard/dashboard.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireApiUser();

    const dashboard =
      await getDashboardService(user.id);

    return NextResponse.json(
      {
        success: true,
        message:
          "Dashboard data retrieved successfully.",
        data: dashboard,
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