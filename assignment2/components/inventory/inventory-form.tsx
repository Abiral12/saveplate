"use client";

import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  LoaderCircle,
  MapPin,
  Package,
  Scale,
  StickyNote,
  Tag,
} from "lucide-react";

import type {
  ApiResponse,
  InventoryItem,
} from "@/types/inventory";

const CATEGORY_OPTIONS = [
  {
    value: "DAIRY",
    label: "Dairy",
  },
  {
    value: "FRUIT",
    label: "Fruit",
  },
  {
    value: "VEGETABLE",
    label: "Vegetable",
  },
  {
    value: "MEAT",
    label: "Meat",
  },
  {
    value: "SEAFOOD",
    label: "Seafood",
  },
  {
    value: "GRAIN",
    label: "Grain",
  },
  {
    value: "BAKERY",
    label: "Bakery",
  },
  {
    value: "FROZEN",
    label: "Frozen",
  },
  {
    value: "CANNED",
    label: "Canned",
  },
  {
    value: "BEVERAGE",
    label: "Beverage",
  },
  {
    value: "SNACK",
    label: "Snack",
  },
  {
    value: "OTHER",
    label: "Other",
  },
] as const;

const UNIT_OPTIONS = [
  {
    value: "PIECE",
    label: "Piece",
  },
  {
    value: "GRAM",
    label: "Gram",
  },
  {
    value: "KILOGRAM",
    label: "Kilogram",
  },
  {
    value: "MILLILITRE",
    label: "Millilitre",
  },
  {
    value: "LITRE",
    label: "Litre",
  },
  {
    value: "PACK",
    label: "Pack",
  },
  {
    value: "BOTTLE",
    label: "Bottle",
  },
  {
    value: "CAN",
    label: "Can",
  },
  {
    value: "BOX",
    label: "Box",
  },
  {
    value: "BAG",
    label: "Bag",
  },
  {
    value: "OTHER",
    label: "Other",
  },
] as const;

type InventoryFormState = {
  itemName: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  category: string;
  storageLocation: string;
  notes: string;
};

type InventoryFormProps = {
  item?: InventoryItem;
  onSuccess?: (
    item: InventoryItem,
  ) => void;
  onCancel?: () => void;
};

function createInitialState(
  item?: InventoryItem,
): InventoryFormState {
  return {
    itemName: item?.itemName ?? "",
    quantity:
      item?.quantity !== undefined
        ? String(item.quantity)
        : "",
    unit: item?.unit ?? "PIECE",
    expiryDate: item?.expiryDate ?? "",
    category:
      item?.category ?? "OTHER",
    storageLocation:
      item?.storageLocation ?? "",
    notes: item?.notes ?? "",
  };
}

function FieldLabel({
  htmlFor,
  children,
  required = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-extrabold text-[#24352E]"
    >
      {children}

      {required ? (
        <span className="ml-1 text-[#DC2626]">
          *
        </span>
      ) : null}
    </label>
  );
}

const inputClassName =
  "h-12 w-full rounded-xl border border-[#D8E1D9] bg-white px-4 text-sm font-semibold text-[#10271F] outline-none transition placeholder:text-[#9AA69F] focus:border-[#0C8A63] focus:ring-4 focus:ring-[#0C8A63]/10 disabled:cursor-not-allowed disabled:bg-[#F5F7F4]";

export function InventoryForm({
  item,
  onSuccess,
  onCancel,
}: InventoryFormProps) {
  const isEditing = Boolean(item);

  const [form, setForm] =
    useState<InventoryFormState>(() =>
      createInitialState(item),
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  function updateField<
    Key extends keyof InventoryFormState,
  >(
    key: Key,
    value: InventoryFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const quantity =
      Number(form.quantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Quantity must be greater than zero.",
      );
      return;
    }

    if (!form.expiryDate) {
      setError(
        "Please select an expiry date.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEditing
        ? `/api/inventory/${item?.id}`
        : "/api/inventory";

      const response = await fetch(
        endpoint,
        {
          method: isEditing
            ? "PATCH"
            : "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            itemName:
              form.itemName.trim(),
            quantity,
            unit: form.unit,
            expiryDate:
              form.expiryDate,
            category:
              form.category,
            storageLocation:
              form.storageLocation.trim() ||
              null,
            notes:
              form.notes.trim() || null,
          }),
        },
      );

      const result =
        (await response.json()) as ApiResponse<InventoryItem>;

      if (
        !response.ok ||
        !result.success ||
        !result.data
      ) {
        throw new Error(
          result.message ||
            "Unable to save the food item.",
        );
      }

      onSuccess?.(result.data);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to save the food item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-sm font-semibold text-[#B91C1C]"
        >
          <AlertCircle
            className="mt-0.5 size-5 shrink-0"
            aria-hidden={true}
          />

          <p>{error}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel
            htmlFor="itemName"
            required
          >
            Food item name
          </FieldLabel>

          <div className="relative">
            <Package
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]"
              aria-hidden={true}
            />

            <input
              id="itemName"
              name="itemName"
              type="text"
              required
              minLength={2}
              maxLength={150}
              autoComplete="off"
              value={form.itemName}
              onChange={(event) =>
                updateField(
                  "itemName",
                  event.target.value,
                )
              }
              placeholder="For example: Fresh milk"
              className={`${inputClassName} pl-12`}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <FieldLabel
            htmlFor="quantity"
            required
          >
            Quantity
          </FieldLabel>

          <div className="relative">
            <Scale
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]"
              aria-hidden={true}
            />

            <input
              id="quantity"
              name="quantity"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.quantity}
              onChange={(event) =>
                updateField(
                  "quantity",
                  event.target.value,
                )
              }
              placeholder="0"
              className={`${inputClassName} pl-12`}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <FieldLabel
            htmlFor="unit"
            required
          >
            Unit
          </FieldLabel>

          <select
            id="unit"
            name="unit"
            required
            value={form.unit}
            onChange={(event) =>
              updateField(
                "unit",
                event.target.value,
              )
            }
            className={inputClassName}
            disabled={isSubmitting}
          >
            {UNIT_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <FieldLabel
            htmlFor="category"
            required
          >
            Category
          </FieldLabel>

          <div className="relative">
            <Tag
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]"
              aria-hidden={true}
            />

            <select
              id="category"
              name="category"
              required
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value,
                )
              }
              className={`${inputClassName} pl-12`}
              disabled={isSubmitting}
            >
              {CATEGORY_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div>
          <FieldLabel
            htmlFor="expiryDate"
            required
          >
            Expiry date
          </FieldLabel>

          <div className="relative">
            <CalendarDays
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]"
              aria-hidden={true}
            />

            <input
              id="expiryDate"
              name="expiryDate"
              type="date"
              required
              value={form.expiryDate}
              onChange={(event) =>
                updateField(
                  "expiryDate",
                  event.target.value,
                )
              }
              className={`${inputClassName} pl-12`}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="storageLocation">
            Storage location
          </FieldLabel>

          <div className="relative">
            <MapPin
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#849087]"
              aria-hidden={true}
            />

            <input
              id="storageLocation"
              name="storageLocation"
              type="text"
              maxLength={50}
              value={form.storageLocation}
              onChange={(event) =>
                updateField(
                  "storageLocation",
                  event.target.value,
                )
              }
              placeholder="For example: Fridge, freezer or pantry"
              className={`${inputClassName} pl-12`}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <FieldLabel htmlFor="notes">
            Notes
          </FieldLabel>

          <div className="relative">
            <StickyNote
              className="pointer-events-none absolute left-4 top-4 size-5 text-[#849087]"
              aria-hidden={true}
            />

            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={1000}
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              placeholder="Add any useful details about this item..."
              className="w-full resize-none rounded-xl border border-[#D8E1D9] bg-white px-4 py-3 pl-12 text-sm font-semibold leading-6 text-[#10271F] outline-none transition placeholder:text-[#9AA69F] focus:border-[#0C8A63] focus:ring-4 focus:ring-[#0C8A63]/10 disabled:cursor-not-allowed disabled:bg-[#F5F7F4]"
              disabled={isSubmitting}
            />
          </div>

          <p className="mt-2 text-right text-xs font-semibold text-[#849087]">
            {form.notes.length}/1000
          </p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8E2] pt-6 sm:flex-row sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#CFD9D1] px-5 text-sm font-extrabold text-[#46574F] transition hover:bg-[#F5F7F3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#065F46] px-6 text-sm font-extrabold text-white shadow-lg shadow-[#065F46]/10 transition hover:bg-[#054C39] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle
              className="size-5 animate-spin"
              aria-hidden={true}
            />
          ) : (
            <Check
              className="size-5"
              aria-hidden={true}
            />
          )}

          {isSubmitting
            ? "Saving item..."
            : isEditing
              ? "Save changes"
              : "Add food item"}
        </button>
      </div>
    </form>
  );
}