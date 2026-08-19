import { z } from "zod";

export const weekQuerySchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "weekStart must be YYYY-MM-DD."),
});

export const mealIngredientSchema = z.object({
  foodItemId: z.string().uuid(),
  quantity: z.coerce.number().positive().max(99999),
});

export const createPlannedMealSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  title: z.string().trim().min(2).max(150),
  notes: z.string().trim().max(1000).optional().nullable(),
  reminderAt: z.string().datetime({ offset: true }).optional().nullable(),
  ingredients: z.array(mealIngredientSchema).min(1, "Select at least one inventory item.").max(20),
});

export const confirmMealPlanSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type WeekQuery = z.infer<typeof weekQuerySchema>;
export type CreatePlannedMealInput = z.infer<typeof createPlannedMealSchema>;
