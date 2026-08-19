export type MealTypeValue = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

export type MealPlannerIngredient = {
  id: string;
  foodItemId: string;
  itemName: string;
  quantity: number;
  unit: string;
};

export type PlannedMealView = {
  id: string;
  mealDate: string;
  mealType: MealTypeValue;
  title: string;
  notes: string | null;
  reminderAt: string | null;
  ingredients: MealPlannerIngredient[];
};

export type MealPlannerInventoryItem = {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: string;
  storageLocation: string | null;
  reservedQuantity: number;
  availableQuantity: number;
  daysUntilExpiry: number;
};

export type RecipeSuggestion = {
  id: string;
  title: string;
  description: string;
  matchedItemIds: string[];
  matchedItems: string[];
  generic: boolean;
};

export type MealPlannerData = {
  weekStart: string;
  weekEnd: string;
  status: "DRAFT" | "CONFIRMED";
  confirmedAt: string | null;
  meals: PlannedMealView[];
  inventory: MealPlannerInventoryItem[];
  suggestions: RecipeSuggestion[];
};
