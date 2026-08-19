import "server-only";

import { FoodItemStatus, Prisma } from "@/app/generated/prisma/client";
import { ApiError } from "@/lib/api/api";
import { prisma } from "@/lib/db/prisma";
import type { CreatePlannedMealInput } from "./meal-planner.schemas";

const DAY_MS = 86_400_000;

function dateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function assertMonday(weekStart: Date) {
  if (weekStart.getUTCDay() !== 1) {
    throw new ApiError(400, "weekStart must be a Monday.");
  }
}

function assertDateInWeek(mealDate: Date, weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  if (mealDate < weekStart || mealDate > weekEnd) {
    throw new ApiError(400, "Meal date must be inside the selected week.");
  }
}

const recipeTemplates = [
  { id: "stir-fry", title: "Use-it-up Stir Fry", description: "A quick stir fry prioritising vegetables and other items closest to expiry.", keywords: ["vegetable", "carrot", "broccoli", "pepper", "cabbage", "mushroom", "onion"] },
  { id: "fried-rice", title: "SavePlate Fried Rice", description: "Combine rice with available vegetables, eggs or leftovers for a low-waste meal.", keywords: ["rice", "egg", "vegetable", "carrot", "peas", "onion"] },
  { id: "fruit-bowl", title: "Fruit & Yogurt Bowl", description: "Use ripe fruit and dairy before expiry for breakfast or a snack.", keywords: ["fruit", "banana", "apple", "berry", "yogurt", "milk"] },
  { id: "soup", title: "Expiry Rescue Soup", description: "A flexible soup for vegetables, herbs, beans and other ingredients nearing expiry.", keywords: ["vegetable", "potato", "tomato", "bean", "carrot", "onion", "herb"] },
  { id: "sandwich", title: "Quick Pantry Sandwich", description: "Build a simple meal from bread, cheese, vegetables or prepared fillings.", keywords: ["bread", "cheese", "lettuce", "tomato", "egg", "ham"] },
  { id: "pasta", title: "Use-What-You-Have Pasta", description: "Pair pasta with vegetables, tomato, cheese or leftovers already in the kitchen.", keywords: ["pasta", "tomato", "cheese", "vegetable", "mushroom", "spinach"] },
] as const;

function recipeSuggestions(items: Array<{ id: string; itemName: string; category: string; expiryDate: Date }>) {
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const searchable = items.map((item) => ({
    ...item,
    text: `${item.itemName} ${item.category}`.toLowerCase(),
    days: Math.ceil((item.expiryDate.getTime() - todayUtc.getTime()) / DAY_MS),
  }));

  const ranked = recipeTemplates.map((recipe) => {
    const matches = searchable.filter((item) => recipe.keywords.some((keyword) => item.text.includes(keyword)));
    const expiryBonus = matches.reduce((sum, item) => sum + (item.days <= 3 ? 2 : item.days <= 7 ? 1 : 0), 0);
    return { recipe, matches, score: matches.length * 3 + expiryBonus };
  }).sort((a, b) => b.score - a.score);

  const matched = ranked.filter((row) => row.matches.length > 0).slice(0, 4);
  const source = matched.length > 0 ? matched : ranked.slice(0, 4);

  return source.map(({ recipe, matches }) => ({
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    matchedItemIds: matches.map((item) => item.id),
    matchedItems: matches.map((item) => item.itemName),
    generic: matches.length === 0,
  }));
}

async function ensurePlan(userId: string, weekStart: Date) {
  return prisma.mealPlan.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart },
    update: {},
  });
}

export async function getMealPlannerService(userId: string, weekStartInput: string) {
  const weekStart = dateOnly(weekStartInput);
  assertMonday(weekStart);
  const weekEnd = addDays(weekStart, 6);
  const plan = await ensurePlan(userId, weekStart);

  const [meals, inventory, reservations] = await prisma.$transaction([
    prisma.plannedMeal.findMany({
      where: { mealPlanId: plan.id },
      orderBy: [{ mealDate: "asc" }, { mealType: "asc" }],
      include: { ingredients: { include: { foodItem: true } } },
    }),
    prisma.foodItem.findMany({
      where: { userId, status: { in: [FoodItemStatus.AVAILABLE, FoodItemStatus.RESERVED] } },
      orderBy: [{ expiryDate: "asc" }, { itemName: "asc" }],
    }),
    prisma.mealPlanIngredient.groupBy({
      by: ["foodItemId"],
      where: {
        plannedMeal: {
          mealPlan: { userId, status: "CONFIRMED" },
          mealDate: { gte: new Date() },
        },
      },
      _sum: { reservedQuantity: true },
    }),
  ]);

  const reservedMap = new Map(reservations.map((row) => [row.foodItemId, Number(row._sum.reservedQuantity ?? 0)]));
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  return {
    weekStart: toDateOnly(weekStart),
    weekEnd: toDateOnly(weekEnd),
    status: plan.status,
    confirmedAt: plan.confirmedAt?.toISOString() ?? null,
    meals: meals.map((meal) => ({
      id: meal.id,
      mealDate: toDateOnly(meal.mealDate),
      mealType: meal.mealType,
      title: meal.title,
      notes: meal.notes,
      reminderAt: meal.reminderAt?.toISOString() ?? null,
      ingredients: meal.ingredients.map((ingredient) => ({
        id: ingredient.id,
        foodItemId: ingredient.foodItemId,
        itemName: ingredient.foodItem.itemName,
        quantity: Number(ingredient.reservedQuantity),
        unit: ingredient.foodItem.unit,
      })),
    })),
    inventory: inventory.map((item) => {
      const reservedQuantity = reservedMap.get(item.id) ?? 0;
      const quantity = Number(item.quantity);
      return {
        id: item.id,
        itemName: item.itemName,
        quantity,
        unit: item.unit,
        category: item.category,
        expiryDate: toDateOnly(item.expiryDate),
        storageLocation: item.storageLocation,
        reservedQuantity,
        availableQuantity: Math.max(0, quantity - reservedQuantity),
        daysUntilExpiry: Math.ceil((item.expiryDate.getTime() - todayUtc.getTime()) / DAY_MS),
      };
    }),
    suggestions: recipeSuggestions(inventory),
  };
}

export async function createPlannedMealService(userId: string, input: CreatePlannedMealInput) {
  const weekStart = dateOnly(input.weekStart);
  const mealDate = dateOnly(input.mealDate);
  assertMonday(weekStart);
  assertDateInWeek(mealDate, weekStart);

  const duplicateIds = new Set<string>();
  for (const ingredient of input.ingredients) {
    if (duplicateIds.has(ingredient.foodItemId)) throw new ApiError(400, "An inventory item can only be added once per meal.");
    duplicateIds.add(ingredient.foodItemId);
  }

  const plan = await ensurePlan(userId, weekStart);
  if (plan.status === "CONFIRMED") throw new ApiError(409, "This week is already confirmed. Create or edit a future week instead.");

  const ids = input.ingredients.map((ingredient) => ingredient.foodItemId);
  const foodItems = await prisma.foodItem.findMany({ where: { id: { in: ids }, userId, status: { in: [FoodItemStatus.AVAILABLE, FoodItemStatus.RESERVED] } } });
  if (foodItems.length !== ids.length) throw new ApiError(400, "One or more selected inventory items are unavailable.");

  const itemMap = new Map(foodItems.map((item) => [item.id, item]));
  for (const ingredient of input.ingredients) {
    const item = itemMap.get(ingredient.foodItemId)!;
    if (ingredient.quantity > Number(item.quantity)) throw new ApiError(400, `${item.itemName} only has ${Number(item.quantity)} ${item.unit} in inventory.`);
  }

  return prisma.plannedMeal.create({
    data: {
      mealPlanId: plan.id,
      mealDate,
      mealType: input.mealType,
      title: input.title.trim(),
      notes: input.notes?.trim() || null,
      reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
      ingredients: {
        create: input.ingredients.map((ingredient) => ({
          foodItemId: ingredient.foodItemId,
          reservedQuantity: new Prisma.Decimal(ingredient.quantity),
        })),
      },
    },
  });
}

export async function deletePlannedMealService(userId: string, mealId: string) {
  const meal = await prisma.plannedMeal.findFirst({ where: { id: mealId, mealPlan: { userId } }, include: { mealPlan: true } });
  if (!meal) throw new ApiError(404, "Planned meal was not found.");
  if (meal.mealPlan.status === "CONFIRMED") throw new ApiError(409, "Confirmed meal plans are locked.");
  await prisma.plannedMeal.delete({ where: { id: mealId } });
}

export async function confirmMealPlanService(userId: string, weekStartInput: string) {
  const weekStart = dateOnly(weekStartInput);
  assertMonday(weekStart);
  const plan = await prisma.mealPlan.findUnique({
    where: { userId_weekStart: { userId, weekStart } },
    include: { meals: { include: { ingredients: { include: { foodItem: true } } } } },
  });
  if (!plan || plan.meals.length === 0) throw new ApiError(400, "Add at least one meal before confirming the week.");
  if (plan.status === "CONFIRMED") return plan;

  const needed = new Map<string, { quantity: number; name: string; unit: string; stock: number }>();
  for (const meal of plan.meals) {
    for (const ingredient of meal.ingredients) {
      const current = needed.get(ingredient.foodItemId) ?? { quantity: 0, name: ingredient.foodItem.itemName, unit: ingredient.foodItem.unit, stock: Number(ingredient.foodItem.quantity) };
      current.quantity += Number(ingredient.reservedQuantity);
      needed.set(ingredient.foodItemId, current);
    }
  }

  const externalReservations = await prisma.mealPlanIngredient.groupBy({
    by: ["foodItemId"],
    where: {
      foodItemId: { in: [...needed.keys()] },
      plannedMeal: { mealPlan: { userId, status: "CONFIRMED", id: { not: plan.id } }, mealDate: { gte: new Date() } },
    },
    _sum: { reservedQuantity: true },
  });
  const externalMap = new Map(externalReservations.map((row) => [row.foodItemId, Number(row._sum.reservedQuantity ?? 0)]));

  for (const [itemId, value] of needed) {
    if (value.quantity + (externalMap.get(itemId) ?? 0) > value.stock) {
      throw new ApiError(409, `Not enough ${value.name}. Reduce planned quantity before confirming.`);
    }
  }

  return prisma.mealPlan.update({ where: { id: plan.id }, data: { status: "CONFIRMED", confirmedAt: new Date() } });
}
