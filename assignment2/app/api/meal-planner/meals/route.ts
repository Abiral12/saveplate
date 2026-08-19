import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/api";
import { requireApiUser } from "@/lib/auth/require-api-user";
import { createPlannedMealSchema } from "@/modules/meal-planner/meal-planner.schemas";
import { createPlannedMealService } from "@/modules/meal-planner/meal-planner.service";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = createPlannedMealSchema.parse(await request.json());
    await createPlannedMealService(user.id, input);
    return NextResponse.json({ success: true, message: "Meal added to your weekly plan." }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
