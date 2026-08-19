import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { weekQuerySchema } from "@/modules/meal-planner/meal-planner.schemas";
import { getMealPlannerService } from "@/modules/meal-planner/meal-planner.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const url = new URL(request.url);
    const query = weekQuerySchema.parse({ weekStart: url.searchParams.get("weekStart") });
    const data = await getMealPlannerService(user.id, query.weekStart);
    return NextResponse.json({ success: true, message: "Meal planner retrieved successfully.", data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleApiError(error);
  }
}
