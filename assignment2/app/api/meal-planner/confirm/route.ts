import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { confirmMealPlanSchema } from "@/modules/meal-planner/meal-planner.schemas";
import { confirmMealPlanService } from "@/modules/meal-planner/meal-planner.service";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = confirmMealPlanSchema.parse(await request.json());
    await confirmMealPlanService(user.id, input.weekStart);
    return NextResponse.json({ success: true, message: "Weekly meal plan confirmed and ingredient quantities reserved." });
  } catch (error) {
    return handleApiError(error);
  }
}
