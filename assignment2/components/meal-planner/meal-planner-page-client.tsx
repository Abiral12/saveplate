"use client";

import { CalendarDays, CheckCircle2, ChefHat, ChevronLeft, ChevronRight, Clock3, Leaf, LoaderCircle, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ApiResponse } from "@/types/api";
import type { MealPlannerData, MealPlannerInventoryItem, MealTypeValue, RecipeSuggestion } from "@/types/meal-planner";

const MEAL_TYPES: Array<{ value: MealTypeValue; label: string }> = [
  { value: "BREAKFAST", label: "Breakfast" }, { value: "LUNCH", label: "Lunch" }, { value: "DINNER", label: "Dinner" }, { value: "SNACK", label: "Snack" },
];

function isoDateLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function mondayFor(date: Date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
  return copy;
}

function shiftWeek(weekStart: string, weeks: number) {
  const [y, m, d] = weekStart.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + weeks * 7);
  return isoDateLocal(date);
}

function dayLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

type IngredientInput = { foodItemId: string; quantity: number };

export function MealPlannerPageClient() {
  const [weekStart, setWeekStart] = useState(() => isoDateLocal(mondayFor(new Date())));
  const [data, setData] = useState<MealPlannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mealDate, setMealDate] = useState(weekStart);
  const [mealType, setMealType] = useState<MealTypeValue>("DINNER");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState("");
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch(`/api/meal-planner?weekStart=${weekStart}`, { credentials: "include", cache: "no-store" });
      const result = (await response.json()) as ApiResponse<MealPlannerData>;
      if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to load meal planner.");
      setData(result.data); setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load meal planner."); }
    finally { setLoading(false); }
  }

  useEffect(() => { setMealDate(weekStart); void load(); }, [weekStart]);

  const weekDays = useMemo(() => {
    const [y, m, d] = weekStart.split("-").map(Number);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(Date.UTC(y, m - 1, d + index));
      return date.toISOString().slice(0, 10);
    });
  }, [weekStart]);

  function toggleIngredient(item: MealPlannerInventoryItem) {
    setIngredients((current) => current.some((x) => x.foodItemId === item.id)
      ? current.filter((x) => x.foodItemId !== item.id)
      : [...current, { foodItemId: item.id, quantity: Math.min(1, Math.max(0.01, item.availableQuantity)) }]);
  }

  function useSuggestion(suggestion: RecipeSuggestion) {
    setTitle(suggestion.title);
    const matched = (data?.inventory ?? []).filter((item) => suggestion.matchedItemIds.includes(item.id) && item.availableQuantity > 0);
    setIngredients(matched.map((item) => ({ foodItemId: item.id, quantity: Math.min(1, item.availableQuantity) })));
    setShowForm(true);
    setMessage(suggestion.generic ? "No exact ingredient match was found, so a generic low-waste recipe was selected." : "Recipe suggestion added. Review the ingredients and quantities before saving.");
  }

  async function addMeal() {
    if (!title.trim() || ingredients.length === 0) { setError("Enter a meal title and select at least one inventory item."); return; }
    setSaving(true); setError(null); setMessage(null);
    try {
      const response = await fetch("/api/meal-planner/meals", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart, mealDate, mealType, title, notes: notes || null, reminderAt: reminder ? new Date(reminder).toISOString() : null, ingredients }),
      });
      const result = await response.json() as ApiResponse<unknown>;
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to add meal.");
      setTitle(""); setNotes(""); setReminder(""); setIngredients([]); setShowForm(false); setMessage(result.message); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to add meal."); }
    finally { setSaving(false); }
  }

  async function removeMeal(id: string) {
    const response = await fetch(`/api/meal-planner/meals/${id}`, { method: "DELETE", credentials: "include" });
    const result = await response.json() as ApiResponse<unknown>;
    if (!response.ok || !result.success) { setError(result.message || "Unable to remove meal."); return; }
    setMessage(result.message); await load();
  }

  async function confirmWeek() {
    setSaving(true); setError(null);
    try {
      const response = await fetch("/api/meal-planner/confirm", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weekStart }) });
      const result = await response.json() as ApiResponse<unknown>;
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to confirm meal plan.");
      setMessage(result.message); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to confirm meal plan."); }
    finally { setSaving(false); }
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-[28px] bg-[#052E24] px-6 py-7 text-white shadow-xl shadow-[#052E24]/10 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div><div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.16em] text-[#BEF264]"><ChefHat className="size-4" /> Plan before food expires</div><h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Weekly Meal Planner</h1><p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/65">Build meals from your current inventory, prioritise expiring ingredients, reserve quantities and schedule reminders.</p></div>
          <div className="flex items-center gap-2"><button onClick={() => setWeekStart(shiftWeek(weekStart, -1))} className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/10"><ChevronLeft className="size-5" /></button><div className="min-w-52 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-center"><p className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">Week</p><p className="text-sm font-extrabold">{dayLabel(weekStart)} – {data ? dayLabel(data.weekEnd) : "..."}</p></div><button onClick={() => setWeekStart(shiftWeek(weekStart, 1))} className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/10"><ChevronRight className="size-5" /></button></div>
        </div>
      </section>

      {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div> : null}
      {message ? <div className="mt-5 rounded-xl border border-[#CFE3A7] bg-[#F6FFE8] px-4 py-3 text-sm font-bold text-[#285A2C]">{message}</div> : null}

      {loading ? <div className="mt-6 grid min-h-72 place-items-center rounded-2xl border border-[#DFE6DE] bg-white"><LoaderCircle className="size-8 animate-spin text-[#285A2C]" /></div> : data ? (
        <>
          <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><div className="rounded-2xl border border-[#DFE6DE] bg-white p-5"><div className="flex items-center gap-3"><span className={`grid size-11 place-items-center rounded-xl ${data.status === "CONFIRMED" ? "bg-[#EFFBD4] text-[#285A2C]" : "bg-amber-50 text-amber-700"}`}>{data.status === "CONFIRMED" ? <CheckCircle2 className="size-5" /> : <CalendarDays className="size-5" />}</span><div><p className="text-sm font-extrabold text-[#10271F]">{data.status === "CONFIRMED" ? "Week confirmed" : "Draft meal plan"}</p><p className="mt-1 text-xs font-semibold text-[#7C8B84]">{data.status === "CONFIRMED" ? "Ingredient quantities are reserved and this week is locked." : `${data.meals.length} meal${data.meals.length === 1 ? "" : "s"} planned. Confirm when ready.`}</p></div></div></div>{data.status === "DRAFT" ? <button onClick={() => void confirmWeek()} disabled={saving || data.meals.length === 0} className="h-12 rounded-xl bg-[#285A2C] px-6 text-sm font-extrabold text-white disabled:opacity-40">Confirm week & reserve food</button> : null}</section>

          <section className="mt-6 overflow-x-auto rounded-2xl border border-[#DFE6DE] bg-white p-4 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-[#10271F]">Weekly calendar</h2><p className="mt-1 text-sm font-medium text-[#7C8B84]">Breakfast, lunch, dinner and snacks.</p></div>{data.status === "DRAFT" ? <button onClick={() => setShowForm((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#BEF264] px-4 text-sm font-extrabold text-[#052E24]"><Plus className="size-4" /> Add meal</button> : null}</div><div className="grid min-w-[980px] grid-cols-7 gap-3">{weekDays.map((day) => <div key={day} className="rounded-xl border border-[#E6EBE4] bg-[#FAFCF9] p-3"><p className="mb-3 text-sm font-extrabold text-[#10271F]">{dayLabel(day)}</p>{MEAL_TYPES.map((slot) => { const meals = data.meals.filter((meal) => meal.mealDate === day && meal.mealType === slot.value); return <div key={slot.value} className="mb-3"><p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#97A49D]">{slot.label}</p>{meals.length === 0 ? <div className="rounded-lg border border-dashed border-[#DDE5DA] px-2 py-3 text-center text-[11px] font-semibold text-[#A0ADA5]">Empty</div> : meals.map((meal) => <div key={meal.id} className="mb-2 rounded-lg bg-white p-2 shadow-sm"><div className="flex items-start justify-between gap-1"><p className="text-xs font-extrabold text-[#285A2C]">{meal.title}</p>{data.status === "DRAFT" ? <button onClick={() => void removeMeal(meal.id)} className="text-[#A0ADA5] hover:text-red-600"><Trash2 className="size-3.5" /></button> : null}</div><p className="mt-1 line-clamp-2 text-[10px] font-medium text-[#7C8B84]">{meal.ingredients.map((x) => x.itemName).join(", ")}</p>{meal.reminderAt ? <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#8B7355]"><Clock3 className="size-3" /> Reminder set</p> : null}</div>)}</div>; })}</div>)}</div></section>

          {showForm && data.status === "DRAFT" ? <section className="mt-6 rounded-2xl border border-[#CFE3A7] bg-[#FBFFF4] p-5 sm:p-6"><h2 className="text-xl font-extrabold text-[#10271F]">Add planned meal</h2><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><label className="grid gap-1.5 text-xs font-extrabold text-[#5F7067]">Day<select value={mealDate} onChange={(e) => setMealDate(e.target.value)} className="h-11 rounded-xl border border-[#D9E2D6] bg-white px-3 text-sm">{weekDays.map((day) => <option key={day} value={day}>{dayLabel(day)}</option>)}</select></label><label className="grid gap-1.5 text-xs font-extrabold text-[#5F7067]">Meal slot<select value={mealType} onChange={(e) => setMealType(e.target.value as MealTypeValue)} className="h-11 rounded-xl border border-[#D9E2D6] bg-white px-3 text-sm">{MEAL_TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label><label className="grid gap-1.5 text-xs font-extrabold text-[#5F7067] md:col-span-2">Meal name<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vegetable stir fry" className="h-11 rounded-xl border border-[#D9E2D6] bg-white px-3 text-sm" /></label><label className="grid gap-1.5 text-xs font-extrabold text-[#5F7067] md:col-span-2">Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional preparation note" className="h-11 rounded-xl border border-[#D9E2D6] bg-white px-3 text-sm" /></label><label className="grid gap-1.5 text-xs font-extrabold text-[#5F7067] md:col-span-2">Reminder date & time<input type="datetime-local" value={reminder} onChange={(e) => setReminder(e.target.value)} className="h-11 rounded-xl border border-[#D9E2D6] bg-white px-3 text-sm" /></label></div><div className="mt-5"><p className="text-xs font-extrabold uppercase tracking-wider text-[#728178]">Inventory ingredients</p><div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3">{data.inventory.filter((item) => item.availableQuantity > 0).map((item) => { const selected = ingredients.find((x) => x.foodItemId === item.id); return <div key={item.id} className={`rounded-xl border p-3 ${selected ? "border-[#75A928] bg-white" : "border-[#E2E8E0] bg-white/70"}`}><label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={Boolean(selected)} onChange={() => toggleIngredient(item)} className="mt-1" /><span className="flex-1"><span className="block text-sm font-extrabold text-[#10271F]">{item.itemName}</span><span className="mt-1 block text-xs font-semibold text-[#7C8B84]">{item.availableQuantity} {item.unit} available · expires {item.daysUntilExpiry <= 0 ? "today" : `in ${item.daysUntilExpiry}d`}</span></span></label>{selected ? <label className="mt-2 flex items-center gap-2 text-xs font-bold text-[#627268]">Reserve<input type="number" min="0.01" step="0.01" max={item.availableQuantity} value={selected.quantity} onChange={(e) => setIngredients((rows) => rows.map((row) => row.foodItemId === item.id ? { ...row, quantity: Number(e.target.value) } : row))} className="h-8 w-24 rounded-lg border border-[#D9E2D6] px-2" />{item.unit}</label> : null}</div>; })}</div></div><div className="mt-5 flex justify-end gap-3"><button onClick={() => setShowForm(false)} className="h-10 rounded-xl border border-[#D9E2D6] bg-white px-4 text-sm font-extrabold text-[#5F7067]">Cancel</button><button onClick={() => void addMeal()} disabled={saving} className="h-10 rounded-xl bg-[#285A2C] px-5 text-sm font-extrabold text-white disabled:opacity-50">{saving ? "Saving..." : "Add to week"}</button></div></section> : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><div className="rounded-2xl border border-[#DFE6DE] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Sparkles className="size-5 text-[#75A928]" /><h2 className="text-xl font-extrabold text-[#10271F]">Suggested meals</h2></div><p className="mt-1 text-sm font-medium text-[#7C8B84]">Suggestions prioritise available ingredients, especially food close to expiry.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{data.suggestions.map((suggestion) => <article key={suggestion.id} className="rounded-xl border border-[#E2E8E0] p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-[#10271F]">{suggestion.title}</h3><p className="mt-1 text-xs font-medium leading-5 text-[#7C8B84]">{suggestion.description}</p></div><Leaf className="size-5 shrink-0 text-[#75A928]" /></div><p className="mt-3 text-xs font-bold text-[#52645B]">{suggestion.matchedItems.length ? `Matches: ${suggestion.matchedItems.join(", ")}` : "Generic recipe – no exact ingredient match"}</p>{data.status === "DRAFT" ? <button onClick={() => useSuggestion(suggestion)} className="mt-3 text-xs font-extrabold text-[#285A2C]">Plan this meal →</button> : null}</article>)}</div></div><div className="rounded-2xl border border-[#DFE6DE] bg-white p-5 sm:p-6"><h2 className="text-xl font-extrabold text-[#10271F]">Inventory availability</h2><p className="mt-1 text-sm font-medium text-[#7C8B84]">Confirmed plans reserve quantities without deleting stock.</p><div className="mt-4 max-h-[390px] space-y-2 overflow-y-auto pr-1">{data.inventory.length === 0 ? <p className="rounded-xl bg-[#F8FAF7] p-4 text-sm font-semibold text-[#7C8B84]">No available inventory. Add food items before planning meals.</p> : data.inventory.map((item) => <div key={item.id} className="rounded-xl border border-[#E6EBE4] p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-extrabold text-[#10271F]">{item.itemName}</p><p className="mt-1 text-xs font-semibold text-[#87958E]">{item.category} · {item.expiryDate}</p></div><div className="text-right"><p className="text-sm font-extrabold text-[#285A2C]">{item.availableQuantity} {item.unit}</p>{item.reservedQuantity > 0 ? <p className="text-[10px] font-bold text-amber-700">{item.reservedQuantity} reserved</p> : null}</div></div></div>)}</div></div></section>
        </>
      ) : null}
    </main>
  );
}
