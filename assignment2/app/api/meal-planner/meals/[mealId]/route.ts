import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { deletePlannedMealService } from "@/modules/meal-planner/meal-planner.service";

type RouteContext = { params: Promise<{ mealId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireApiUser();
    const { mealId } = await context.params;
    await deletePlannedMealService(user.id, mealId);
    return NextResponse.json({ success: true, message: "Planned meal removed." });
  } catch (error) {
    return handleApiError(error);
  }
}
