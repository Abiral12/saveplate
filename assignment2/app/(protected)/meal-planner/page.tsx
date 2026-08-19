import type { Metadata } from "next";
import { MealPlannerPageClient } from "@/components/meal-planner/meal-planner-page-client";

export const metadata: Metadata = {
  title: "Meal Planner",
  description: "Plan weekly meals from your SavePlate inventory and reduce food waste.",
};

export default function MealPlannerPage() {
  return <MealPlannerPageClient />;
}
